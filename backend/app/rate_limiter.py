import time
import asyncio
from typing import Dict, Tuple, Optional
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import os

DEFAULT_MAX = 10
DEFAULT_WINDOW = 60



class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, paths=None):
        super().__init__(app)
        self.paths = set(paths or ["/register", "/login"])
        # keep defaults; read env dynamically in dispatch to respect test-time env changes
        self.max_requests = DEFAULT_MAX
        self.window = DEFAULT_WINDOW
        self.redis = None
        self.lock = asyncio.Lock()

        # do not initialize redis here; initialize lazily in dispatch

        # fallback in-memory store for single-instance/testing
        self.counters: Dict[str, Tuple[int, float]] = {}

    async def _check_redis(self, key: str) -> Optional[Tuple[bool, int]]:
        try:
            # use INCR and set expire if first increment
            cur = await self.redis.incr(key)
            if cur == 1:
                await self.redis.expire(key, self.window)
            ttl = await self.redis.ttl(key)
            allowed = cur <= self.max_requests
            return allowed, ttl if ttl >= 0 else self.window
        except Exception:
            return None

    async def dispatch(self, request: Request, call_next):
        try:
            # honor env changes at request time
            try:
                self.max_requests = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", str(DEFAULT_MAX)))
            except Exception:
                self.max_requests = DEFAULT_MAX
            try:
                self.window = int(os.getenv("RATE_LIMIT_WINDOW", str(DEFAULT_WINDOW)))
            except Exception:
                self.window = DEFAULT_WINDOW

            # lazily initialize redis if a REDIS_URL is configured
            if self.redis is None:
                redis_url = os.getenv("REDIS_URL") or os.getenv("REDIS_URI")
                if redis_url:
                    try:
                        import redis.asyncio as aioredis

                        self.redis = aioredis.from_url(redis_url)
                    except Exception:
                        self.redis = None

            if request.method.upper() == "POST" and request.url.path in self.paths:
                client = request.client.host if request.client else "anonymous"
                key = f"rl:{request.url.path}:{client}"

                # prefer redis if configured
                if self.redis:
                    res = await self._check_redis(key)
                    if res is not None:
                        allowed, retry_after = res
                        if not allowed:
                            return JSONResponse({"detail": "Too many requests"}, status_code=429, headers={"Retry-After": str(retry_after)})

                else:
                    now = time.time()
                    async with self.lock:
                        count, start = self.counters.get(key, (0, now))
                        if now - start > self.window:
                            count = 0
                            start = now
                        count += 1
                        self.counters[key] = (count, start)
                        if count > self.max_requests:
                            retry_after = int(self.window - (now - start))
                            return JSONResponse({"detail": "Too many requests"}, status_code=429, headers={"Retry-After": str(retry_after)})

            response = await call_next(request)
            return response
        except Exception:
            return await call_next(request)
