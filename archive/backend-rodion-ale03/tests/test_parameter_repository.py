from app.repositories.parameter import ParRepository
from app.db.models import  Parameter

def test_get_by_id_not_found(db):
    result = ParRepository.get_by_id(999, db)

    assert result is None

def test_get_by_id_exists(db):
    par = Parameter(
        name = "pytest",
        unit = "pytest",
        description = "pytest",
        limits = "pytest",
    )
    db.add(par)
    db.commit()
    result = ParRepository.get_by_id(par.id,db)
    assert result is not None
    assert result.name == "pytest"

def test_get_all(db):
    par1 = Parameter(
        name = "pytest1",
        unit = "pytest1",
        description = "pytest1",
        limits = "pytest1",
    )
    par2 = Parameter(
        name = "pytest2",
        unit = "pytest2",
        description = "pytest2",
        limits = "pytest2",
    )
    par3 = Parameter(
        name = "pytest3",
        unit = "pytest3",
        description = "pytest3",
        limits = "pytest3",
    )
    db.add_all([par1,par2,par3])
    db.commit()
    result = ParRepository.get_all(db)
    assert result is not None
    assert {par.name for par in result} == {
        "pytest1", "pytest2", "pytest3"
    }