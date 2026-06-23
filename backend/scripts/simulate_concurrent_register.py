"""Simulate concurrent registration requests against the backend.

Usage:
  export BASE_URL=http://localhost:8000
  export ATTEMPTS=20
  export TEST_EMAIL=race@example.com
  python3 backend/scripts/simulate_concurrent_register.py

By default this will send multiple simultaneous requests with the same email
to exercise unique-constraint / race-condition behavior.
"""
import asyncio
import os
import random
import string
import httpx


def random_suffix(n=6):
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(n))


async def register(client: httpx.AsyncClient, base_url: str, name: str, email: str, password: str):
    try:
        r = await client.post(f"{base_url}/register", json={
            "name": name,
            "email": email,
            "password": password
        }, timeout=15.0)
        return r.status_code, r.text
    except Exception as e:
        return "error", str(e)


async def main():
    base_url = os.getenv("BASE_URL", "http://localhost:8000")
    attempts = int(os.getenv("ATTEMPTS", "10"))
    same_email = os.getenv("SAME_EMAIL", "true").lower() in ("1", "true", "yes")
    test_email = os.getenv("TEST_EMAIL", f"race+{random_suffix()}@example.com")

    print(f"Base URL: {base_url}")
    print(f"Attempts: {attempts}, same_email={same_email}, test_email={test_email}")

    async with httpx.AsyncClient() as client:
        tasks = []
        for i in range(attempts):
            if same_email:
                email = test_email
            else:
                email = f"user{i}+{random_suffix()}@example.com"

            name = f"User{i}"
            tasks.append(register(client, base_url, name, email, "Password123!"))

        results = await asyncio.gather(*tasks)

    for idx, res in enumerate(results):
        print(f"[{idx}] {res}")


if __name__ == "__main__":
    asyncio.run(main())
