import pytest

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.database import Base
from app.db import models

@pytest.fixture
def db(tmp_path):
    engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}"
    )
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:
        yield session

    engine.dispose()