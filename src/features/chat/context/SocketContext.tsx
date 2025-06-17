import { useUser } from '@/features/auth/hooks';
import { authService } from '@/features/auth/services/AuthService';
import Message from '@/models/Message';
import { notifyUser } from '@/utils/notificationUtils';
import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  selectChat: (chatId: string) => void;
  createChat: (title: string) => void;
  sendMessage: (content: string) => void;
  activeChatId: string | null;
  isLoading: boolean;
  chatMessages: Message[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const { isAuthenticated, user } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    setChatMessages([]);
  }, [activeChatId]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = authService.getToken();

    if (!token) {
      return;
    }

    let socketUrl;
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const url = new URL(apiBaseUrl);
      socketUrl = `${url.protocol}//${url.host}`;
    } catch (error) {
      console.error('Error parsing API URL:', error);
    }

    const socketInstance = io(socketUrl, {
      auth: {
        token: token,
      },
      extraHeaders: {
        'x-auth-token': token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'],
      forceNew: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);

      if (isAuthenticated) {
        notifyUser.error('Connection error', 'Connection failed. Please check your network.');
      }
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);

      if (isAuthenticated) {
        notifyUser.error('Chat error', error.message || 'An error occurred');
      }
    });

    socketInstance.on('chat message', (msg) => {
      try {
        const parsedMsg = typeof msg === 'string' ? JSON.parse(msg) : msg;

        if (parsedMsg.chatId) {
          setChatMessages((prev) => {
            if (parsedMsg.id) {
              const existing = prev.findIndex((m) => m.id === parsedMsg.id);
              if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = {
                  ...parsedMsg,
                  message: parsedMsg.message,
                  loading: false,
                };
                return updated;
              }
            }

            return [
              ...prev,
              {
                _id: parsedMsg._id || parsedMsg.id || `temp-${Date.now()}`,
                id: parsedMsg.id,
                chatId: parsedMsg.chatId,
                content: parsedMsg.content || parsedMsg.message || '',
                from: parsedMsg.from,
                message: parsedMsg.message || '',
                loading: parsedMsg.loading,
                error: parsedMsg.error,
                createdAt: parsedMsg.createdAt || new Date().toISOString(),
                updatedAt: parsedMsg.updatedAt || new Date().toISOString(),
                userId: parsedMsg.userId || parsedMsg.from || 'unknown',
                action: parsedMsg.action,
              } as Message,
            ];
          });

          queryClient.invalidateQueries({ queryKey: ['chats', parsedMsg.chatId] });
          queryClient.invalidateQueries({ queryKey: ['chatMessages', parsedMsg.chatId] });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    socketInstance.on('chat created', (chat) => {
      const chatId = chat._id || chat.chatId;
      if (chatId) {
        setActiveChatId(chatId);
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        notifyUser.success('Chat created', 'New chat has been created');
      }
    });

    socketInstance.on('chat selected', (data) => {
      queryClient.invalidateQueries({ queryKey: ['chats', data.chatId] });
    });

    socketInstance.on('chats list', (chats) => {
      queryClient.setQueryData(['chats'], chats);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, queryClient]);

  const selectChat = useCallback(
    (chatId: string) => {
      if (!socket) return;

      setIsLoading(true);
      socket.emit('select chat', chatId);
      setActiveChatId(chatId);
      setIsLoading(false);
    },
    [socket]
  );

  const createChat = useCallback(
    (title: string) => {
      if (!socket) return;

      setIsLoading(true);
      socket.emit('create chat', title || 'New Chat');
    },
    [socket]
  );

  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !activeChatId) return;

      socket.emit('chat message', content);
    },
    [socket, activeChatId]
  );

  const value = {
    socket,
    isConnected,
    isLoading,
    selectChat,
    createChat,
    sendMessage,
    activeChatId,
    chatMessages,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
