from app.db.database import Base, engine
from app.db.models import Parameter, Rule


Base.metadata.create_all(bind=engine)

