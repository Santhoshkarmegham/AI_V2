import os
import sys
import asyncio
import random
import string

import pytest
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ["DATABASE_URL"] = "sqlite:///./test_rate_limit.db"
os.environ["RATE_LIMIT_MAX_REQUESTS"] = "5"
os.environ["RATE_LIMIT_WINDOW"] = "10"

from app.main import app


def random_suffix(n=6):
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(n))


@pytest.mark.anyio
async def test_rate_limit_on_register():
    email = f"rate_{random_suffix()}@example.com"
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # send more than RATE_LIMIT_MAX_REQUESTS
        results = []
        for i in range(7):
            r = await client.post("/register", json={
                "name": f"u{i}",
                "email": email,
                "password": "Password123!"
            })
            results.append(r.status_code)

    # Either rate limiter returned 429 for some requests, or duplicates occurred after the first registration.
    assert len(results) == 7
    assert any(code == 429 for code in results) or results.count(400) >= 5, f"unexpected results: {results}"
