from sqlalchemy.orm import Session
from app.db.models import Requests


class RequestRepository:
    @staticmethod
    def create(request: Requests, db: Session):
        db.add(request)
        return request