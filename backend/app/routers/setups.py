"""Сетапы пользователя на сервере: список, создание, чтение, обновление, удаление."""

import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.catalog import get_catalog
from app.db import get_db
from app.models import Setup, User
from app.security import current_user

router = APIRouter(prefix="/api/v2/setups")
MAX_DATA = 64_000


class SetupIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    car_id: str
    track_id: str
    data: dict

    @field_validator("data")
    @classmethod
    def _size(cls, v: dict) -> dict:
        if len(json.dumps(v)) > MAX_DATA:
            raise ValueError("Слишком большой сетап")
        return v


def out(s: Setup) -> dict:
    return {"id": s.id, "name": s.name, "car_id": s.car_id, "track_id": s.track_id, "data": s.data, "created_at": s.created_at.isoformat(), "updated_at": s.updated_at.isoformat()}


def _check(data: SetupIn) -> None:
    c = get_catalog()
    fields = {}
    if data.car_id not in c.cars:
        fields["car_id"] = "Нет такой машины"
    if data.track_id not in c.tracks:
        fields["track_id"] = "Нет такой трассы"
    if fields:
        raise HTTPException(400, {"code": "validation_error", "message": "Проверьте заполнение полей", "fields": fields})


def _own(db: Session, user: User, setup_id: str) -> Setup:
    s = db.get(Setup, setup_id)
    if not s or s.user_id != user.id:
        raise HTTPException(404, {"code": "not_found", "message": "Сетап не найден"})
    return s


@router.get("")
def list_setups(user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    rows = db.scalars(select(Setup).where(Setup.user_id == user.id).order_by(Setup.updated_at.desc()))
    return {"setups": [out(s) for s in rows]}


@router.post("", status_code=201)
def create(data: SetupIn, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    _check(data)
    s = Setup(user_id=user.id, **data.model_dump())
    db.add(s)
    db.commit()
    return {"setup": out(s)}


@router.get("/{setup_id}")
def read(setup_id: str, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    return {"setup": out(_own(db, user, setup_id))}


@router.post("/{setup_id}")
def update(setup_id: str, data: SetupIn, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    _check(data)
    s = _own(db, user, setup_id)
    s.name, s.car_id, s.track_id, s.data = data.name, data.car_id, data.track_id, data.data
    db.commit()
    return {"setup": out(s)}


@router.post("/{setup_id}/delete")
def delete(setup_id: str, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict:
    db.delete(_own(db, user, setup_id))
    db.commit()
    return {"status": "ok"}
