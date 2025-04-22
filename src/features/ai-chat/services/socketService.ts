import { EventsMap, SOCKET_EVENTS } from '@/models/Socket';
import { io, Socket } from 'socket.io-client';

type EventCallback<T extends keyof EventsMap> = (data: EventsMap[T]) => void;

interface SocketEventCallbacks {
  [SOCKET_EVENTS.SUGGESTION_PREVIEW]?: EventCallback<typeof SOCKET_EVENTS.SUGGESTION_PREVIEW>;
  [SOCKET_EVENTS.SUGGESTION_STATUS_UPDATE]?: EventCallback<
    typeof SOCKET_EVENTS.SUGGESTION_STATUS_UPDATE
  >;
  [SOCKET_EVENTS.USER_TYPING]?: EventCallback<typeof SOCKET_EVENTS.USER_TYPING>;
  [SOCKET_EVENTS.AI_TYPING]?: EventCallback<typeof SOCKET_EVENTS.AI_TYPING>;
  [SOCKET_EVENTS.NEW_MESSAGE]?: EventCallback<typeof SOCKET_EVENTS.NEW_MESSAGE>;
  [SOCKET_EVENTS.MESSAGE_READ_STATUS]?: EventCallback<typeof SOCKET_EVENTS.MESSAGE_READ_STATUS>;
}

class SocketService {
  private socket: Socket | null = null;
  private sessionId: string | null = null;
  private callbacks: SocketEventCallbacks = {};
  private connected = false;
  private socketEnabled = true; // Flag to track if socket should be enabled

  connect(sessionId: string, token: string, callbacks: SocketEventCallbacks = {}) {
    this.sessionId = sessionId;
    this.callbacks = callbacks;

    // Check if socket should be enabled (can be controlled via localStorage for development)
    this.socketEnabled = localStorage.getItem('enableSockets') !== 'false';

    if (!this.socketEnabled) {
      console.log('Socket connections disabled. Set localStorage.enableSockets = "true" to enable');
      return this;
    }

    try {
      const socketUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

      // Clean up any existing connection
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      this.socket = io(socketUrl, {
        auth: { token },
        query: { sessionId },
        path: '/socket.io',
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 5000,
        transports: ['websocket'],
        forceNew: true, // Ensure a fresh connection
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
      this.socket = null;
    }

    return this;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Socket connected successfully');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error.message);
      if (this.socket?.disconnected) {
        console.warn('Socket disconnected after connection errors - some features will be limited');
      }
    });

    this.setupTypedEventListener(SOCKET_EVENTS.SUGGESTION_PREVIEW);
    this.setupTypedEventListener(SOCKET_EVENTS.SUGGESTION_STATUS_UPDATE);
    this.setupTypedEventListener(SOCKET_EVENTS.USER_TYPING);
    this.setupTypedEventListener(SOCKET_EVENTS.AI_TYPING);
    this.setupTypedEventListener(SOCKET_EVENTS.NEW_MESSAGE);
    this.setupTypedEventListener(SOCKET_EVENTS.MESSAGE_READ_STATUS);
  }

  private setupTypedEventListener<T extends keyof EventsMap>(event: T) {
    if (!this.socket) return;

    this.socket.on(event as string, (data: EventsMap[T]) => {
      const callback = this.callbacks[event] as EventCallback<T> | undefined;
      if (callback) {
        callback(data);
      }
    });
  }

  emitTyping(isTyping: boolean) {
    if (!this.socket || !this.sessionId || !this.connected) return;
    this.socket.emit('typing', { isTyping, sessionId: this.sessionId });
  }

  emitMessageRead(messageId: string) {
    if (!this.socket || !this.sessionId || !this.connected) return;
    this.socket.emit('message_read', { messageId, sessionId: this.sessionId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.sessionId = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.socketEnabled && this.connected && !!this.socket?.connected;
  }
}

export const socketService = new SocketService();
