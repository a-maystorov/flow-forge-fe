import { authService } from '@/features/auth/services';
import Board from '@/models/Board';
import axios from 'axios';

class BoardService {
  http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  private getHeaders() {
    return {
      'x-auth-token': authService.getToken(),
    };
  }

  async getBoards() {
    const res = await this.http.get<Board[]>('/boards', { headers: this.getHeaders() });
    return res.data;
  }

  async getBoard(id: string) {
    const res = await this.http.get<Board>(`/boards/${id}`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async createBoard(name: string) {
    const res = await this.http.post<Board>('/boards', { name }, { headers: this.getHeaders() });
    return res.data;
  }

  async updateBoard(id: string, name: string) {
    const res = await this.http.put<Board>(
      `/boards/${id}`,
      { name },
      {
        headers: this.getHeaders(),
      }
    );
    return res.data;
  }

  async deleteBoard(id: string) {
    const res = await this.http.delete(`/boards/${id}`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }
}

export const boardService = new BoardService();
