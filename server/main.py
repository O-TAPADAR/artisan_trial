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

# Define a POST endpoint to add a message to a conversation
@app.post("/conversations/{conversation_id}/chat", response_model=ChatRead)
async def chat(conversation_id: int, message: ChatCreate, session: Session = Depends(get_session)):
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    chat_entry = Chat(user=message.user, bot="", conversation_id=conversation_id)
    session.add(chat_entry)
    session.commit()
    session.refresh(chat_entry)

    bot_response = f"Echo: {message.user}"
    
    chat_entry.bot = bot_response
    session.add(chat_entry)
    session.commit()

    return chat_entry

# Define a GET endpoint to retrieve the chat history 
@app.get("/conversations/{conversation_id}/history", response_model=List[ChatRead])
async def get_history(conversation_id: int, session: Session = Depends(get_session)):
    statement = select(Chat).where(Chat.conversation_id == conversation_id)
    results = session.exec(statement)
    chat_history = results.all()
    return chat_history

# Define a DELETE endpoint to delete a specific chat message
@app.delete("/conversations/{conversation_id}/chat/{chat_id}")
async def delete_chat(conversation_id: int, chat_id: int, session: Session = Depends(get_session)): 
    chat_entry = session.get(Chat, chat_id)
    if not chat_entry or chat_entry.conversation_id != conversation_id:
        raise HTTPException(status_code=404, detail="Chat entry not found")

    session.delete(chat_entry)
    session.commit()
    
    return {"message": "Chat entry deleted successfully"}

# Define a PUT endpoint to edit a specific chat message
@app.put("/conversations/{conversation_id}/chat/{chat_id}")
async def edit_chat(conversation_id: int, chat_id: int, message: ChatCreate, session: Session = Depends(get_session)):
    # Fetch the chat entry by id
    chat_entry = session.get(Chat, chat_id)
    if not chat_entry or chat_entry.conversation_id != conversation_id:
        raise HTTPException(status_code=404, detail="Chat entry not found")
    
    # Edit the chat entry
    chat_entry.user = message.user
    chat_entry.bot = f"Echo: {message.user}"
    session.add(chat_entry)
    session.commit()

    return {"message": "Chat entry updated successfully"}

# Get all conversations
@app.get("/conversations/", response_model=List[ConversationRead])
async def get_conversations(session: Session = Depends(get_session)):
    statement = select(Conversation)
    results = session.exec(statement)
    conversations = results.all()
    return conversations