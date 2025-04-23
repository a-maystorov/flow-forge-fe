import { ChatMessage } from '@/models/ChatMessage';
import { ChatSession } from '@/models/ChatSession';
import { authService } from '@/features/auth/services';
import axios from 'axios';

class ChatService {
  private http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  private getHeaders() {
    const token = authService.getToken();
    return {
      'x-auth-token': token,
      'Content-Type': 'application/json',
    };
  }

  async getAllSessions(
    limit = 10,
    status: 'active' | 'archived' | 'all' = 'active'
  ): Promise<ChatSession[]> {
    const res = await this.http.get<ChatSession[]>(`/chat?limit=${limit}&status=${status}`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async createSession(title?: string, boardId?: string, taskId?: string): Promise<ChatSession> {
    const res = await this.http.post<ChatSession>(
      '/chat',
      { title, boardId, taskId },
      {
        headers: this.getHeaders(),
      }
    );
    return res.data;
  }

  async getSessionMessages(sessionId: string, limit = 50, skip = 0): Promise<ChatMessage[]> {
    const res = await this.http.get<ChatMessage[]>(
      `/chat/${sessionId}/messages?limit=${limit}&skip=${skip}`,
      {
        headers: this.getHeaders(),
      }
    );
    return res.data;
  }

  async addMessage(sessionId: string, content: string): Promise<ChatMessage> {
    const res = await this.http.post<ChatMessage>(
      `/chat/${sessionId}/messages`,
      { message: content }, // Note: backend expects 'message' not 'content'
      {
        headers: this.getHeaders(),
      }
    );
    return res.data;
  }

  async updateTypingStatus(sessionId: string, isTyping: boolean): Promise<void> {
    await this.http.post(
      `/chat/${sessionId}/typing`,
      { isTyping },
      {
        headers: this.getHeaders(),
      }
    );
  }

  async acceptSuggestion(suggestionId: string): Promise<void> {
    await this.http.post(
      `/suggestions/${suggestionId}/accept`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
  }

  async rejectSuggestion(suggestionId: string): Promise<void> {
    await this.http.post(
      `/suggestions/${suggestionId}/reject`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
  }
}

export const chatService = new ChatService();
