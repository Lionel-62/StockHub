import { useState, useEffect } from "react";
import { useClients } from "./clients";

export interface Message {
  id: string;
  conversationId: string;
  senderId: "me" | string; // 'me' for the merchant, clientId for the client
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  clientId: string;
  lastMessageAt: string;
  unreadCount: number;
}

const mockMessages: Message[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "client-1",
    content: "Bonjour, avez-vous le Riz parfumé en stock ?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: true,
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    senderId: "me",
    content: "Bonjour ! Oui, nous l'avons. Combien de sacs vous faut-il ?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    isRead: true,
  },
  {
    id: "msg-3",
    conversationId: "conv-2",
    senderId: "client-2",
    content: "Ma commande est-elle prête ?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isRead: false,
  }
];

const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    clientId: "1", // Assuming client 1 exists
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    unreadCount: 0,
  },
  {
    id: "conv-2",
    clientId: "2", // Assuming client 2 exists
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unreadCount: 1,
  }
];

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedMessages = localStorage.getItem("stockhub_messages");
    const storedConversations = localStorage.getItem("stockhub_conversations");
    
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      setMessages(mockMessages);
      localStorage.setItem("stockhub_messages", JSON.stringify(mockMessages));
    }
    
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    } else {
      setConversations(mockConversations);
      localStorage.setItem("stockhub_conversations", JSON.stringify(mockConversations));
    }
    
    setIsLoaded(true);
  }, []);

  const saveMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    localStorage.setItem("stockhub_messages", JSON.stringify(newMessages));
  };

  const saveConversations = (newConversations: Conversation[]) => {
    setConversations(newConversations);
    localStorage.setItem("stockhub_conversations", JSON.stringify(newConversations));
  };

  const sendMessage = (clientId: string, content: string, senderId: "me" | string = "me") => {
    let conv = conversations.find(c => c.clientId === clientId);
    
    if (!conv) {
      conv = {
        id: `conv-${Date.now()}`,
        clientId,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0
      };
      saveConversations([conv, ...conversations]);
    } else {
      // Update existing conversation
      const updatedConv = {
        ...conv,
        lastMessageAt: new Date().toISOString(),
        unreadCount: senderId !== "me" ? conv.unreadCount + 1 : conv.unreadCount
      };
      saveConversations(conversations.map(c => c.id === conv?.id ? updatedConv : c));
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: conv.id,
      senderId,
      content,
      timestamp: new Date().toISOString(),
      isRead: senderId === "me"
    };

    saveMessages([...messages, newMessage]);
  };

  const markAsRead = (conversationId: string) => {
    saveConversations(conversations.map(c => {
      if (c.id === conversationId) {
        return { ...c, unreadCount: 0 };
      }
      return c;
    }));
    
    saveMessages(messages.map(m => {
      if (m.conversationId === conversationId && !m.isRead) {
        return { ...m, isRead: true };
      }
      return m;
    }));
  };

  return { 
    messages, 
    conversations, 
    isLoaded, 
    sendMessage, 
    markAsRead 
  };
}
