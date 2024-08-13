import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App: React.FC = () => {
  const [newMessage, setNewMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/conversations/')
      .then(response => setConversations(response.data))
      .catch(error => console.error('Error fetching conversations:', error));
  }, []);

  useEffect(() => {
    if (selectedConversation !== null) {
      axios.get(`http://127.0.0.1:8000/conversations/${selectedConversation}/history`)
        .then(response => setChatHistory(response.data))
        .catch(error => console.error('Error fetching chat history:', error));
    }
  }, [selectedConversation]);

  const handleNewConversation = () => {
    axios.post('http://127.0.0.1:8000/conversations/')
      .then(response => {
        setConversations([...conversations, response.data]);
        setSelectedConversation(response.data.id);
      })
      .catch(error => console.error('Error creating conversation:', error));
  };

  const handleSendMessage = () => {
    if (selectedConversation !== null && newMessage) {
      axios.post(`http://127.0.0.1:8000/conversations/${selectedConversation}/chat`, {
        user: newMessage,
      }).then(response => {
        setChatHistory([...chatHistory, response.data]);
        setNewMessage('');
      }).catch(error => console.error('Error sending message:', error));
    }
  };

  const handleDeleteMessage = (chatId: number) => {
    if (selectedConversation !== null) {
      axios.delete(`http://127.0.0.1:8000/conversations/${selectedConversation}/chat/${chatId}`)
        .then(() => {
          setChatHistory(chatHistory.filter(chat => chat.id !== chatId));
        })
        .catch(error => console.error('Error deleting message:', error));
    }
  };

  const handleEditMessage = (chatId: number) => {
    if (selectedConversation !== null) {
      axios.put(`http://127.0.0.1:8000/conversations/${selectedConversation}/chat/${chatId}`, {
        user: editingText,
      }).then(() => {
        setChatHistory(chatHistory.map(chat =>
          chat.id === chatId ? { ...chat, user: editingText, bot: `Echo: ${editingText}` } : chat
        ));
        setEditingId(null);
        setEditingText('');
      }).catch(error => console.error('Error editing message:', error));
    }
  };

  const startEditing = (id: number, text: string) => {
      setEditingId(id);
      setEditingText(text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  return (
    <div>
      <h1>Chat Application</h1>

      <button onClick={handleNewConversation}>Start New Conversation</button>

      <div>
        <h2>Conversations</h2>
        <ul>
          {conversations.map(conversation => (
            <li key={conversation.id} onClick={() => setSelectedConversation(conversation.id)}>
              Conversation {conversation.id}
            </li>
          ))}
        </ul>
      </div>

      {selectedConversation !== null && (
        <div>
          <h2>Chat History</h2>
          <ul>
            {chatHistory.map(chat => (
              <li key={chat.id}>
                {editingId === chat.id ? (
                  <div>
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                    <button onClick={() => handleEditMessage(chat.id)}>Save</button>
                    <button onClick={cancelEditing}>Cancel</button>
                  </div>
                ) : (
                  <div>
                    <strong>User:</strong> {chat.user} <br />
                    <strong>Bot:</strong> {chat.bot} <br />
                    <button onClick={() => startEditing(chat.id, chat.user)}>Edit</button>
                    <button onClick={() => handleDeleteMessage(chat.id)}>Delete</button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message"
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default App;