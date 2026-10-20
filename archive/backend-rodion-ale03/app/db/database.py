from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///./simracing.db"

engine = create_engine(DATABASE_URL)

class Base(DeclarativeBase):
    pass

SessionLocal = sessionmaker(
    bind = engine,
    autoflush=False,
    autocommit = False
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
