from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import ArgumentError
from dotenv import load_dotenv
import os
import typing

load_dotenv()

# Read DATABASE_URL from env. If missing or invalid, fall back to a local sqlite file
raw_db = os.getenv("DATABASE_URL")

def _default_sqlite_path() -> str:
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    return f"sqlite:///{os.path.join(base, 'test.db')}"

if not raw_db or not isinstance(raw_db, str) or ("://" not in raw_db and not raw_db.startswith("sqlite")):
    DATABASE_URL = _default_sqlite_path()
else:
    DATABASE_URL = raw_db

try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
    )
except ArgumentError as e:
    raise RuntimeError(
        f"Invalid DATABASE_URL value ({DATABASE_URL!r}). Set a valid SQLAlchemy URL in the DATABASE_URL env var. Original: {e}"
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()