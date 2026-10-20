from sqlalchemy import ForeignKey, JSON, func, DateTime, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.db.database import Base
from uuid import UUID, uuid4

class Parameter(Base):
    __tablename__ = "parameters"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()
    unit: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column()
    limits: Mapped[str] = mapped_column()

    rules: Mapped[list["Rule"]] = relationship(
        back_populates="parameter"
    )

class Rule(Base):
    __tablename__ = "rules"

    id: Mapped[int] = mapped_column(primary_key=True)

    rule_id: Mapped[str] = mapped_column(
        unique=True,
        nullable=False
    )

    symptom_type: Mapped[str] = mapped_column()
    corner_phase: Mapped[str] = mapped_column()
    stint_moment: Mapped[str | None] = mapped_column(nullable=True)

    parameter_id: Mapped[int] = mapped_column(
        ForeignKey("parameters.id")
    )

    parameter: Mapped["Parameter"] = relationship(
        back_populates="rules"
    )

    direction: Mapped[str] = mapped_column()
    change_description: Mapped[str] = mapped_column()
    expected_effect: Mapped[str] = mapped_column()
    limitations: Mapped[str] = mapped_column()

    applicability: Mapped[dict[str, list[str]]] = mapped_column(JSON)

    verification_status: Mapped[str] = mapped_column()
    basis: Mapped[str] = mapped_column()

class Requests(Base):
    __tablename__ = "request"

    request_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4
    )
    car: Mapped[str] = mapped_column()
    track: Mapped[str] = mapped_column()
    symptom_type: Mapped[str] = mapped_column()
    corner_phase: Mapped[str] = mapped_column()
    stint_moment: Mapped[str] = mapped_column()
    comment: Mapped[str] = mapped_column()
    status: Mapped[str] = mapped_column()
    rule_ids: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=list
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.current_timestamp()
    )