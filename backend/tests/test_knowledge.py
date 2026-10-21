import pytest

from app.advice.candidates import Diagnosis, find_candidates
from app.advice.changes import build_change
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
            cars = [x for x in c.cars.values() if x["category"] == cls and (not e.cars or x["id"] in e.cars)]
            with_param = [c.car_params(x["id"])[e.param] for x in cars if e.param in c.car_params(x["id"])]
            assert with_param, f"{e.id}: ни у одной машины {cls} нет {e.param}"
            for param in with_param:
                assert e.slot in SLOTS[param["kind"]], f"{e.id}: слот {e.slot}"


@pytest.mark.parametrize("car_id", sorted(get_catalog().cars))
@pytest.mark.parametrize("symptom", ["understeer", "oversteer"])
@pytest.mark.parametrize("phase", PHASES)
def test_every_car_covers_every_handling_problem(car_id, symptom, phase):
    c = get_catalog()
    car = c.cars[car_id]
    cls = car["category"]
    track = next(t for t in c.tracks.values() if t["kind"] in c.classes[cls]["tracks"])
    found = find_candidates(c, car, track, Diagnosis(symptom, phase, "any", "any"), set())
    assert found, f"{car_id} {symptom} {phase}"
    params = c.car_params(car_id)
    assert all(e.param in params for e in found), "совет по регулировке, которой нет у машины"


def test_garages_follow_iracing_manuals():
    c = get_catalog()
    assert set(c.garages) == set(c.cars)
    bmw_gt4, mclaren_gt4, porsche_gt4 = (c.car_params(x) for x in ("bmw-m4-g82-gt4-evo", "mclaren-570s-gt4", "porsche-718-cayman-gt4-clubsport"))
    assert "bump" not in bmw_gt4 and "abs" not in bmw_gt4 and bmw_gt4["dsc"]["kind"] == "choice"
    assert "tc" not in mclaren_gt4 and "absTc" in mclaren_gt4
    assert "springRate" not in porsche_gt4 and "tc" not in porsche_gt4
    lambo = c.car_params("lamborghini-huracan-gt3-evo")
    assert "lsComp" not in lambo and {"bump", "rebound"} <= set(lambo)
    challenge = c.car_params("ferrari-296-challenge")
    assert "brakeBias" not in challenge and "tc2" in challenge and challenge["arbFront"]["kind"] == "choice"
    assert "frictionFaces" not in c.car_params("bmw-m4-gt3-evo")
    assert c.car_params("mercedes-amg-gt3-2020")["tc"].get("inverted") and c.car_params("mclaren-720s-gt3-evo")["lsComp"].get("inverted")
    assert not c.car_params("ferrari-296-gt3")["lsComp"].get("inverted")


def _effect(effect_id):
    return next(e for e in all_effects() if e.id == effect_id)


def test_inverted_scale_turns_the_change_around():
    c = get_catalog()
    more_tc = _effect("road-tc-up")
    assert build_change(more_tc, c.car_params("ferrari-296-gt3")["tc"], {}, 1, "ru")["delta"] == 1
    # У Mercedes-AMG GT3 1 — больше всего помощи: «сильнее антипробуксовка» — это −1
    assert build_change(more_tc, c.car_params("mercedes-amg-gt3-2020")["tc"], {}, 1, "ru")["delta"] == -1


def test_choice_from_baseline_goes_to_the_end_of_the_scale():
    c = get_catalog()
    arb = c.car_params("ferrari-296-challenge")["arbFront"]
    stiffer = build_change(_effect("road-farb-stiff"), arb, {}, 1, "ru")
    softer = build_change(_effect("road-farb-soft"), arb, {}, 1, "ru")
    assert stiffer["from"] == "base" and stiffer["to"] == "stiff"
    assert softer["to"] == "soft"
    assert build_change(_effect("road-farb-soft"), arb, {"arbFront": "soft"}, 1, "ru") is None


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
