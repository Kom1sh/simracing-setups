from fastapi import APIRouter

from app.catalog import get_catalog
from app.knowledge.effects import all_effects, manuals

router = APIRouter(prefix="/api/v2")


@router.get("/catalog")
def catalog() -> dict:
    """Классы, машины, трассы и гаражи iRacing — тот же каталог, что в кабинете."""
    c = get_catalog()
    return {"classes": list(c.classes.values()), "cars": list(c.cars.values()), "tracks": list(c.tracks.values()), "templates": c.templates}


@router.get("/knowledge/effects")
def effects() -> dict:
    """Таблица эффектов с источниками — для проверки командой."""
    m = manuals()
    return {
        "effects": [
            {
                "id": e.id,
                "classes": e.classes,
                "param": e.param,
                "slot": e.slot,
                "direction": e.direction,
                "fixes": e.fixes,
                "effect": e.effect,
                "tradeoff": e.tradeoff,
                "source": {**e.source, "title": m[e.source["manual"]]["title"], "url": m[e.source["manual"]]["url"]},
            }
            for e in all_effects()
        ]
    }
