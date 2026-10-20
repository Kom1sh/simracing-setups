from sqlalchemy.orm import Session
from sqlalchemy import select

from app.schemas.parameter import CreateParameterRequest
from app.db.models import Parameter

class ParRepository:
    @staticmethod
    def get_by_id(parameter_id:int, db:Session):
        parameter = db.get(Parameter, parameter_id)
        return parameter

    @staticmethod
    def get_all(db:Session):
        statement = select(Parameter)
        parameter = db.scalars(statement).all()
        return parameter

    @staticmethod
    def create(data:CreateParameterRequest,db:Session):
        parameter = Parameter(
            name = data.name,
            unit = data.unit,
            description = data.description,
            limits = data.limits,
        )
        db.add(parameter)
        return parameter

    @staticmethod
    def get_by_name(name:str, db:Session):
        statement = select(Parameter).where(Parameter.name == name)
        parameter = db.scalars(statement).first()
        return parameter