from sqlalchemy.orm import Session
from uuid import UUID

from app.repositories.rule import RuleRepository
from app.schemas.recommendation import RecommendationRequest
from app.db.models import Rule
from app.repositories.request import RequestRepository
from app.db.models import Requests

class RecommendationService:

    @staticmethod
    def get_recommendations(
        data: RecommendationRequest,
        db: Session,
        request_id:UUID,
    ):

        candidates = RuleRepository.get_candidates(
            symptom_type=data.symptom_type,
            corner_phase=data.corner_phase,
            stint_moment=data.stint_moment,
            db=db,
        )

        result = []

        for rule in candidates:
            applicability = rule.applicability

            if not isinstance(applicability, dict):
                continue

            cars = applicability.get("car") or []
            tracks = applicability.get("track") or []

            if data.car in cars and data.track in tracks:
                result.append(rule)

        request = Requests(
            request_id=request_id,
            car=data.car,
            track=data.track,
            symptom_type=data.symptom_type,
            corner_phase=data.corner_phase,
            stint_moment=data.stint_moment,
            comment=data.comment,
            status="match" if result else "no_match",
            rule_ids=[rule.rule_id for rule in result]
        )

        RequestRepository.create(request, db)
        db.commit()

        return result
