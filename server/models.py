from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional

class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    chats: List["Chat"] = Relationship(back_populates="conversation")

class Chat(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user: str
    bot: str
    conversation_id: Optional[int] = Field(default=None, foreign_key="conversation.id")
    
    conversation: Optional[Conversation] = Relationship(back_populates="chats")