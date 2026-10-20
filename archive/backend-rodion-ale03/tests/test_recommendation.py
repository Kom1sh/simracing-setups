from uuid import uuid4

from app.db.models import Parameter, Rule
from app.schemas.recommendation import RecommendationRequest
from app.services.recommendation import RecommendationService


def make_request():
    return RecommendationRequest(
        car="Test Car",
        track="Test Track",
        symptom_type="understeer",
        corner_phase="entry",
        stint_moment="from_start",
        comment="Машина плохо поворачивает",
    )


def create_rule(
    db,
    symptom_type="understeer",
    track="Test Track",
):
    rule_id = f"TEST-{uuid4().hex[:12]}"

    parameter = Parameter(
        name=f"parameter_{rule_id}",
        unit="%",
        description="Test parameter",
        limits="0-100",
    )

    rule = Rule(
        rule_id=rule_id,
        symptom_type=symptom_type,
        corner_phase="entry",
        stint_moment=None,
        parameter=parameter,
        direction="increase",
        change_description="Test change",
        expected_effect="Test effect",
        limitations="Test limitations",
        applicability={
            "car": ["Test Car"],
            "track": [track],
        },
        verification_status="verified",
        basis="Test basis",
    )

    db.add(rule)
    db.commit()

    return rule


def test_rec_no_match(db):
    data = make_request()

    result = RecommendationService.get_recommendations(
        data, db, uuid4()
    )

    assert result == []


def test_rec_match(db):
    rule = create_rule(db)
    data = make_request()

    result = RecommendationService.get_recommendations(
        data, db, uuid4()
    )

    assert len(result) == 1
    assert result[0].rule_id == rule.rule_id


def test_other_track_no_match(db):
    create_rule(db, track="Another Track")
    data = make_request()

    result = RecommendationService.get_recommendations(
        data, db, uuid4()
    )

    assert result == []


def test_get_recommendations(db):
    rule1 = create_rule(db)
    rule2 = create_rule(db)
    create_rule(db, symptom_type="oversteer")

    data = make_request()

    result = RecommendationService.get_recommendations(
        data, db, uuid4()
    )

    assert len(result) == 2

    result_ids = {rule.rule_id for rule in result}

    assert result_ids == {
        rule1.rule_id,
        rule2.rule_id,
    }