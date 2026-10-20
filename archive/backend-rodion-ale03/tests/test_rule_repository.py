import pytest
from uuid import uuid4

from app.db.models import Parameter, Rule
from app.repositories.rule import RuleRepository


@pytest.fixture
def sample_rules(db):
    par1 = Parameter(
        name="Tire Pressure",
        unit="psi",
        description="Tire pressure",
        limits="20-35",
    )

    par2 = Parameter(
        name="Rear Wing",
        unit="degrees",
        description="Rear wing angle",
        limits="0-15",
    )

    def make_rule(parameter, status="verified"):
        return Rule(
            rule_id=f"TEST-{uuid4().hex[:12]}",
            symptom_type="understeer",
            corner_phase="entry",
            stint_moment=None,
            parameter=parameter,
            direction="increase",
            change_description="Test change",
            expected_effect="Test effect",
            limitations="Test limitations",
            applicability={
                "car": ["Test Car"],
                "track": ["Test Track"],
            },
            verification_status=status,
            basis="Test basis",
        )

    rule1 = make_rule(par1)
    rule2 = make_rule(par2)
    rule3 = make_rule(par1, status="draft_not_allowed")

    db.add_all([rule1, rule2, rule3])
    db.commit()

    return par1, par2, rule1, rule2, rule3


def test_get_by_id_exists(db, sample_rules):
    _, _, rule1, _, _ = sample_rules

    result = RuleRepository.get_by_id(rule1.id, db)

    assert result is not None
    assert result.id == rule1.id


def test_get_by_id_not_found(db):
    result = RuleRepository.get_by_id(-1, db)

    assert result is None


def test_get_all(db, sample_rules):
    _, _, rule1, rule2, rule3 = sample_rules

    result = RuleRepository.get_all(db)
    result_ids = {rule.id for rule in result}

    assert {rule1.id, rule2.id, rule3.id} <= result_ids


def test_get_candidates(db, sample_rules):
    _, _, rule1, rule2, _ = sample_rules

    result = RuleRepository.get_candidates(
        symptom_type="understeer",
        corner_phase="entry",
        stint_moment=None,
        db=db,
    )

    assert {rule.id for rule in result} == {
        rule1.id,
        rule2.id,
    }


def test_get_by_parameter_id(db, sample_rules):
    par1, _, rule1, _, rule3 = sample_rules

    result = RuleRepository.get_by_parameter_id(
        par1.id, db
    )

    assert {rule.id for rule in result} == {
        rule1.id,
        rule3.id,
    }


def test_rule_parameter_relationship(db, sample_rules):
    par1, _, rule1, _, _ = sample_rules

    assert rule1.parameter.id == par1.id
    assert rule1 in par1.rules