import { authService } from '@/features/auth/services';
import Chat from '@/models/Chat';
import Message from '@/models/Message';
import axios from 'axios';

class ChatService {
  http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  private getHeaders() {
    return {
      'x-auth-token': authService.getToken(),
    };
  }

  async getChats() {
    const res = await this.http.get<Chat[]>('/chats', { headers: this.getHeaders() });
    return res.data;
  }

  async getChat(chatId: string) {
    const res = await this.http.get<Chat>(`/chats/${chatId}`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async getChatMessages(chatId: string) {
    const res = await this.http.get<Message[]>(`/chats/${chatId}/messages`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async deleteChat(chatId: string) {
    const res = await this.http.delete(`/chats/${chatId}`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }
}

export const chatService = new ChatService();
