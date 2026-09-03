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

const mockMessages: Message[] = [];

const mockConversations: Conversation[] = [];

export function useMessages(publicShopId?: string) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [isLoaded, setIsLoaded] = useState(false);

  const getShopId = () => {
    if (publicShopId) return publicShopId;
    const session = localStorage.getItem("stockhub_session");
    if (session) {
      const user = JSON.parse(session);
      return user.shopId;
    }
    return "default";
  };

  useEffect(() => {
    const shopId = getShopId();
    const storedMessages = localStorage.getItem(`stockhub_messages_v2_${shopId}`);
    const storedConversations = localStorage.getItem(`stockhub_conversations_v2_${shopId}`);
    
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      setMessages(mockMessages);
      localStorage.setItem(`stockhub_messages_v2_${shopId}`, JSON.stringify(mockMessages));
    }
    
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    } else {
      setConversations(mockConversations);
      localStorage.setItem(`stockhub_conversations_v2_${shopId}`, JSON.stringify(mockConversations));
    }
    
    setIsLoaded(true);
  }, []);

  const saveMessages = (newMessages: Message[]) => {
    const shopId = getShopId();
    setMessages(newMessages);
    localStorage.setItem(`stockhub_messages_v2_${shopId}`, JSON.stringify(newMessages));
  };

  const saveConversations = (newConversations: Conversation[]) => {
    const shopId = getShopId();
    setConversations(newConversations);
    localStorage.setItem(`stockhub_conversations_v2_${shopId}`, JSON.stringify(newConversations));
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
