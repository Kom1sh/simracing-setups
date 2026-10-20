from sqlalchemy.orm import Session

from app.db.database import engine
from app.db.models import Parameter, Rule

with Session(engine) as db:

    parameter = Parameter(
        name="front_brake_bias_pct",
        unit="%",
        description="Test parameter",
        limits="Test limits",
    )

    rule = Rule(
        rule_id="TEST-001",
        symptom_type="understeer",
        corner_phase="entry",
        stint_moment=None,
        parameter=parameter,
        direction="decrease",
        change_description="Тестовое изменение параметра",
        expected_effect="Тестовый ожидаемый эффект",
        limitations="Только для проверки API",
        applicability={
            "car": ["NASCAR Cup Series Next Gen (Gen 7)"],
            "track": ["Daytona International Speedway"],
        },
        verification_status="verified",
        basis="TEST",
    )

    db.add(rule)
    db.commit()