import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from main import app, get_session

# Set up a test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Dependency override to use the test database
def override_get_session():
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()

# Override the default dependency with our test session
app.dependency_overrides[get_session] = override_get_session

# Create a TestClient
client = TestClient(app)

# Set up the database before running tests
@pytest.fixture(scope="module", autouse=True)
def setup_db():
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)

def test_create_conversation():
    response = client.post("/conversations/")
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert isinstance(data["id"], int)

def test_add_message_to_conversation():
    # Create a conversation first
    response = client.post("/conversations/")
    assert response.status_code == 200
    conversation_id = response.json()["id"]

    # Add a chat message to the conversation
    chat_data = {"user": "Hello"}
    response = client.post(f"/conversations/{conversation_id}/chat", json=chat_data)
    assert response.status_code == 200
    data = response.json()
    assert data["user"] == "Hello"
    assert data["bot"] == "Echo: Hello"
    assert data["conversation_id"] == conversation_id

def test_get_chat_history():
    # Create a conversation and add a message
    response = client.post("/conversations/")
    assert response.status_code == 200
    conversation_id = response.json()["id"]

    chat_data = {"user": "Hello again"}
    client.post(f"/conversations/{conversation_id}/chat", json=chat_data)

    # Retrieve chat history
    response = client.get(f"/conversations/{conversation_id}/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["user"] == "Hello again"

def test_edit_chat_message():
    # Create a conversation and add a message
    response = client.post("/conversations/")
    assert response.status_code == 200
    conversation_id = response.json()["id"]

    chat_data = {"user": "Edit me"}
    response = client.post(f"/conversations/{conversation_id}/chat", json=chat_data)
    assert response.status_code == 200
    chat_id = response.json()["id"]

    # Edit the chat message
    new_chat_data = {"user": "Edited message"}
    response = client.put(f"/conversations/{conversation_id}/chat/{chat_id}", json=new_chat_data)
    assert response.status_code == 200

    # Verify the edit
    response = client.get(f"/conversations/{conversation_id}/history")
    assert response.status_code == 200
    data = response.json()
    assert data[0]["user"] == "Edited message"
    assert data[0]["bot"] == "Echo: Edited message"

def test_delete_chat_message():
    # Create a conversation and add a message
    response = client.post("/conversations/")
    assert response.status_code == 200
    conversation_id = response.json()["id"]

    chat_data = {"user": "Delete me"}
    response = client.post(f"/conversations/{conversation_id}/chat", json=chat_data)
    assert response.status_code == 200
    chat_id = response.json()["id"]

    # Delete the chat message
    response = client.delete(f"/conversations/{conversation_id}/chat/{chat_id}")
    assert response.status_code == 200
    assert response.json() == {"message": "Chat entry deleted successfully"}

    # Verify the deletion
    response = client.get(f"/conversations/{conversation_id}/history")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0

def test_get_all_conversations():
    # Create a few conversations
    client.post("/conversations/")
    client.post("/conversations/")
    client.post("/conversations/")

    # Retrieve all conversations
    response = client.get("/conversations/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
