"""
Database session management
"""
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.db.base import engine

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for getting database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()