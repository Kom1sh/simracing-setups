from pydantic import BaseModel

class CreateParameterRequest(BaseModel):
    name: str
    unit: str
    description: str
    limits: str