from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.session_routes import router as session_router
from api.brainstorm_routes import router as brainstorm_router
from api.interview_routes import router as interview_router
from api.canvas_routes import router as canvas_router
from api.voice_routes import router as voice_router
from api.user_routes import router as user_router
from api.recharge_routes import router as recharge_router
from core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not settings.llm_api_key:
        print("WARNING: LLM_API_KEY 未设置，仅支持 BYOK 模式（用户自带 API Key）")
    yield


app = FastAPI(title="产品脑暴工作台 API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session_router)
app.include_router(brainstorm_router)
app.include_router(interview_router)
app.include_router(canvas_router)
app.include_router(voice_router)
app.include_router(user_router)
app.include_router(recharge_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
