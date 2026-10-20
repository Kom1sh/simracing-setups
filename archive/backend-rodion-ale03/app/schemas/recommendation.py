from pydantic import BaseModel, Field
from typing import Literal
from uuid import UUID

class RecommendationRequest(BaseModel):
    car:str
    track:str
    symptom_type: Literal["understeer", "oversteer"]
    corner_phase: Literal["entry", "mid", "exit"]
    comment: str = Field(min_length=3, max_length=500)
    stint_moment: Literal["from_start", "after_laps"] | None = None 

class RecommendationItem(BaseModel):
    rule_id: str
    parameter: str
    direction: Literal["increase", "decrease"]
    change_description: str
    expected_effect: str
    limitations: str
    basis: str

class RecommendationMatchResponse(BaseModel):
    status: Literal["match"] = "match"
    request_id: UUID
    recommendations: list[RecommendationItem] = Field(min_length=1)

class RecommendationNoMatchResponse(BaseModel):
    status: Literal["no_match"] = "no_match"
    request_id: UUID
    message: str

RecommendationResponse = (
    RecommendationMatchResponse | RecommendationNoMatchResponse
)