import React, { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem('chatHistory')
      return saved ? JSON.parse(saved) : [{ id: 'default', name: 'New Session', messages: [] }]
    } catch (e) {
      console.error('Failed to parse chat history:', e)
      return [{ id: 'default', name: 'New Session', messages: [] }]
    }
  });
  const [activeChatId, setActiveChatId] = useState('default');

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chats));
  }, [chats]);

  const addChat = () => {
    const newChat = {
      id: `chat-${Math.random().toString(36).substr(2, 9)}`,
      name: `Chat ${chats.length + 1}`,
      messages: []
    };
    setChats([...chats, newChat]);
    setActiveChatId(newChat.id);
  };

  const addMessage = (chatId, message) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, messages: [...chat.messages, message] };
      }
      return chat;
    }));
  };

  const deleteChat = (id) => {
    if (chats.length <= 1) return;
    const filtered = chats.filter(c => c.id !== id);
    setChats(filtered);
    if (activeChatId === id) {
      setActiveChatId(filtered[0].id);
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  return (
    <ChatContext.Provider value={{ 
      chats, 
      activeChat, 
      setActiveChatId, 
      addChat, 
      addMessage, 
      deleteChat 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
