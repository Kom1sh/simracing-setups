import pytest

from app.advice.candidates import Diagnosis, find_candidates
from app.catalog import SLOTS, get_catalog
from app.knowledge.chunks import chunk_manual
from app.knowledge.effects import PHASES, all_effects, manuals
from app.knowledge.pdftext import reading_order


def test_effects_reference_real_params_slots_and_manuals():
    c = get_catalog()
    ids = set()
    for e in all_effects():
        assert e.id not in ids, f"повтор id {e.id}"
        ids.add(e.id)
        assert e.classes and e.direction in {"increase", "decrease"} and e.source["manual"] in manuals()
        assert e.source["quote"].strip() and e.effect["ru"] and e.effect["en"] and e.tradeoff["ru"] and e.tradeoff["en"]
        for cls in e.classes:
            params = c.params(cls)
            assert e.param in params, f"{e.id}: нет {e.param} в гараже {cls}"
            assert e.slot in SLOTS[params[e.param]["kind"]], f"{e.id}: слот {e.slot}"


@pytest.mark.parametrize("cls", ["nascar", "gt3", "gt4", "cup"])
@pytest.mark.parametrize("symptom", ["understeer", "oversteer"])
@pytest.mark.parametrize("phase", PHASES)
def test_every_class_covers_every_handling_problem(cls, symptom, phase):
    c = get_catalog()
    car = next(x for x in c.cars.values() if x["category"] == cls)
    track = next(t for t in c.tracks.values() if t["kind"] in c.classes[cls]["tracks"])
    assert find_candidates(c, car, track, Diagnosis(symptom, phase, "any", "any"), set()), f"{cls} {symptom} {phase}"


def test_no_rain_params_for_nascar_and_no_abs_rows():
    c = get_catalog()
    car = c.cars["nascar-next-gen-chevrolet-camaro"]
    found = find_candidates(c, car, c.tracks["daytona"], Diagnosis("lockup", "entry", "any", "any"), set())
    assert found and all(e.param != "abs" for e in found)


def test_reading_order_splits_columns():
    left = "Left column text about ARB stiffness and understeer."
    right = "Right column text about the rear wing angle."
    page = "\n".join(f"{left:<60}{right}" for _ in range(8))
    out = reading_order(page)
    assert out.index(left) < out.index(right)
    assert out.count(left) == 8 and left + right not in out


def test_chunk_manual_tags_params():
    text = "TOC\nADVANCED SETUP OPTIONS\nx\nADVANCED SETUP OPTIONS | CHASSIS\nFRONT\nARB BL ADES\n" + "Higher values induce understeer while cornering. " * 3 + "\nCROSS WEIGHT\n" + "Higher cross weight stabilizes entry and exit of corners. " * 3
    chunks = chunk_manual(text, {"arbFront", "arbRear", "crossWeight"})
    tags = {c["heading"]: c["params"] for c in chunks}
    assert tags["Arb Blades"] == ["arbFront"] and tags["Cross Weight"] == ["crossWeight"]


def test_keyword_diagnosis_on_golden_set():
    """Запасной разбор по словам (без модели) понимает все жалобы золотого набора."""
    import json
    from pathlib import Path

    from app.advice.keywords import keyword_diagnosis

    for c in json.loads((Path(__file__).parent.parent / "eval" / "golden.json").read_text(encoding="utf-8")):
        s, p, _ = keyword_diagnosis(c["text"])
        expected = c["symptom"] if isinstance(c["symptom"], list) else [c["symptom"]]
        assert s in expected and p == c["phase"], (c["id"], s, p)


def test_keyword_after_laps():
    from app.advice.keywords import keyword_diagnosis

    assert keyword_diagnosis("к концу стинта машину выносит в повороте") == ("understeer", "mid", "after_laps")
