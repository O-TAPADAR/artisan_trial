from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Chat, Conversation
from schemas import ChatCreate, ChatRead, ConversationRead
from database import get_session, engine
from sqlmodel import SQLModel, Session, select

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

# Define a POST endpoint to create a new conversation
@app.post("/conversations/", response_model=ConversationRead)
async def create_conversation(session: Session = Depends(get_session)):
    conversation = Conversation()
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation

# Get all conversations
@app.get("/conversations/", response_model=List[ConversationRead])
async def get_conversations(session: Session = Depends(get_session)):
    statement = select(Conversation)
    results = session.exec(statement)
    conversations = results.all()
    return conversations