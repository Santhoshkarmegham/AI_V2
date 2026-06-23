import os
import sys
import asyncio
import random
import string

import httpx
import pytest

# Ensure backend package is importable when pytest runs from /backend
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Ensure rate limiter doesn't block this concurrency test (set high limits for this test run)
os.environ["RATE_LIMIT_MAX_REQUESTS"] = "1000"
os.environ["RATE_LIMIT_WINDOW"] = "60"

# Use a dedicated sqlite file for the test DB
os.environ["DATABASE_URL"] = "sqlite:///./test_concurrency.db"

from app.main import app
from app.database import Base, engine


def random_suffix(n=6):
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(n))


# recreate schema for a clean test run
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


@pytest.mark.anyio
async def test_concurrent_registration():
    base_email = f"race_{random_suffix()}@example.com"
    attempts = 20

    from httpx import AsyncClient, ASGITransport

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        tasks = [
            client.post(
                "/register",
                json={"name": f"user{i}", "email": base_email, "password": "Password123!"},
                timeout=10.0,
            )
            for i in range(attempts)
        ]

        responses = await asyncio.gather(*tasks)

    statuses = [r.status_code for r in responses]
    success = statuses.count(200)
    duplicates = statuses.count(400)

    assert success >= 1, f"expected at least one success, got statuses: {statuses}"
    assert duplicates >= 1, f"expected duplicates, got statuses: {statuses}"
    assert success + duplicates == attempts, f"unexpected status codes: {statuses}"
