from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from app.db.models import Rule


class RuleRepository:

    @staticmethod
    def get_by_id(rule_id: int, db: Session):
        return db.get(Rule, rule_id)

    @staticmethod
    def get_by_rule_id(rule_id: str, db: Session):
        stmt = select(Rule).where(Rule.rule_id == rule_id)
        return db.scalar(stmt)

    @staticmethod
    def get_all(db: Session):
        stmt = select(Rule).order_by(Rule.id)
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_by_parameter_id(parameter_id: int, db: Session):
        stmt = select(Rule).where(
            Rule.parameter_id == parameter_id
        )
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_candidates(
        symptom_type: str,
        corner_phase: str,
        stint_moment: str | None,
        db: Session,
    ):
        stmt = select(Rule).where(
            Rule.symptom_type == symptom_type,
            Rule.corner_phase == corner_phase,
            Rule.verification_status == "verified",
        )

        if stint_moment is not None:
            stmt = stmt.where(
                or_(
                    Rule.stint_moment == stint_moment,
                    Rule.stint_moment.is_(None),
                )
            )

        stmt = stmt.order_by(Rule.id)

        return list(db.scalars(stmt).all())