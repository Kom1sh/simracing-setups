from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import uuid4

from app.services.recommendation import RecommendationService
from app.db.database import get_db
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationItem,
    RecommendationMatchResponse,
    RecommendationNoMatchResponse,
)
router = APIRouter()

@router.post("/api/v1/recommendations")
def get_recommendations(
    data: RecommendationRequest,
    db: Session = Depends(get_db)
):
    request_id = uuid4()
    result = RecommendationService.get_recommendations(data, db, request_id)

    if not result:
        return RecommendationNoMatchResponse(
            request_id=request_id,
            message="Подходящее правило не найдено."
        )

    recommendations = []

    for rule in result:
        item = RecommendationItem(
            rule_id=rule.rule_id,
            parameter=rule.parameter.name,
            direction=rule.direction,
            change_description=rule.change_description,
            expected_effect=rule.expected_effect,
            limitations=rule.limitations,
            basis=rule.basis,
        )
        recommendations.append(item)

    return RecommendationMatchResponse(
        request_id=request_id,
        recommendations=recommendations
    )