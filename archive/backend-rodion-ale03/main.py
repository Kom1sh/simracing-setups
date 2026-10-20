from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import logging
from fastapi.middleware.cors import CORSMiddleware

from app.routers.health import router as health_router
from app.routers.recommendation import router as recommendation_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://kom1sh.github.io",
        "http://localhost:5173",
        "http://localhost:4173",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.include_router(health_router)
app.include_router(recommendation_router)

logger = logging.getLogger(__name__)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request:Request,
    exc: RequestValidationError
):
    fields = {}
    for error in exc.errors():
        field_name = str(error["loc"][-1])
        fields[field_name] = error["msg"]

    return JSONResponse(
        status_code=400,
        content={
            "status": "error",
            "error": {
                "code": "validation_error",
                "message": "Проверьте заполнение полей",
                "fields": fields
            }
        }
    )

@app.exception_handler(Exception)
async def internal_error_handler(request: Request, exc: Exception):
    logger.error("Internal server error", exc_info=exc)

    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error": {
                "code": "internal_error",
                "message": "Внутренняя ошибка сервера"
            }
        }
    )

# @app.get("/test-500")
# def test_internal_error():
#     raise RuntimeError("test")