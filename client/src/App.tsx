import React, { useState, useEffect } from 'react';
import axios from 'axios';
import botAvatar from './bot_avatar_url.png';
import userAvatar from './user_avatar_url.png';
import './App.css';

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
    <div className="container">
        {/* Header */}
        <div className="header">
            <img src={botAvatar} alt="Bot Avatar" />
            <div>
                <h2>Hey👋, I'm Ava</h2>
                <p>Ask me anything or pick a place to start</p>
            </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
            <div className="conversations-container">
                <div className="conversations-header">
                    <h2>Conversations</h2>
                    <button className="new-conversation-button" onClick={handleNewConversation}>+</button>
                </div>
                <div>
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv.id)}
                            className={`conversation-item ${selectedConversation === conv.id ? 'selected' : ''}`}>
                            <div className="conversation-item-icon">
                                {conv.id}
                            </div>
                            <span>Conversation {conv.id}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-area">
                <div className="chat-history">
                    {chatHistory.map((entry) => (
                        <React.Fragment key={entry.id}>

                            {/* User Message Bubble */}
                            {entry.user && (
                                <div className="message-bubble user">
                                    <img src={userAvatar} alt="User Avatar" className="message-avatar user" />
                                    <div className="message-content user">
                                        {editingId === entry.id ? (
                                            <div className="message-editing">
                                                <input
                                                    type="text"
                                                    value={editingText}
                                                    onChange={(e) => setEditingText(e.target.value)}
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter') {
                                                        handleEditMessage(entry.id);
                                                      }
                                                  }}
                                                    style={{ width: '80%', padding: '5px' }}
                                                />
                                                <button onClick={() => handleEditMessage(entry.id)} >Save</button>
                                                <button className="cancel" onClick={cancelEditing}>Cancel</button>
                                            </div>
                                        ) : (
                                            <div>
                                                <p style={{ margin: 0 }}>{entry.user}</p>
                                                <div className="message-actions">
                                                    <button className="edit" onClick={() => startEditing(entry.id, entry.user)}>
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button className="delete" onClick={() => handleDeleteMessage(entry.id)}>
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Bot Message Bubble */}
                            {entry.bot && (
                                <div className="message-bubble bot">
                                    <img src={botAvatar} alt="Bot Avatar" className="message-avatar bot" />
                                    <div className="message-content bot">
                                        <p style={{ margin: 0 }}>{entry.bot}</p>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {selectedConversation !== null && (
                    <div className="input-section">
                        <input type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSendMessage();
                                }
                            }}
                            placeholder="Your question"/>
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                  )}
            </div>
        </div>
    </div>
  );
};

export default App;