from typing import List
from sqlmodel import SQLModel

# Base schemas
class ChatBase(SQLModel):
    user: str

class ConversationBase(SQLModel):
    pass

# Create schemas (for incoming data)
class ChatCreate(ChatBase):
    pass  

class ConversationCreate(ConversationBase):
    pass  

# Read schemas (for outgoing data)
class ChatRead(ChatBase):
    id: int
    bot: str
    conversation_id: int

class ConversationRead(ConversationBase):
    id: int
    chats: List[ChatRead] = []