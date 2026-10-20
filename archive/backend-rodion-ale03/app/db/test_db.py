from sqlalchemy.orm import Session
from app.db.database import engine
from app.db.models import Parameter, Rule
from sqlalchemy import select

# with Session(engine) as session:
#     par = Parameter(
#         name ="test",
#         unit="test",
#         description="test",
#         limits="test",
#     )
#     session.add(par)
#     session.commit()
with Session(engine) as session:
    r = Rule(
        symptom = "test",
        parameter_id = 1,
        direction = "test",
        effect = "test",
        limitations = "test",
        applicability = "test",
        verification_status = "test",
        basis = "test",
    )
    session.add(r)
    session.commit()

with Session(engine) as session:
    rule = session.scalars(select(Rule)).first()
    print(rule.symptom)
    print(rule.parameter_id)
    print(rule.parameter.name)
    print(rule.parameter.rules)