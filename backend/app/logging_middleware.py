import time
import json
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger("request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        try:
            response = await call_next(request)
            status = getattr(response, "status_code", None) or 200
        except Exception as exc:  # noqa: BLE001
            status = 500
            raise
        finally:
            duration_ms = int((time.time() - start) * 1000)
            client = None
            if request.client:
                client = request.client.host

            log_record = {
                "method": request.method,
                "path": request.url.path,
                "status_code": status,
                "duration_ms": duration_ms,
                "client": client,
            }
            try:
                logger.info(json.dumps(log_record))
            except Exception:
                logger.info(str(log_record))

        return response
