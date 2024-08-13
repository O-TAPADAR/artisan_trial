from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import Chat, Conversation
from schemas import ChatCreate, ChatRead, ConversationRead
from database import get_session, engine
from sqlmodel import SQLModel

@asynccontextmanager
async def lifespan(_: FastAPI):
    # Create the database tables
    SQLModel.metadata.create_all(bind=engine)
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}