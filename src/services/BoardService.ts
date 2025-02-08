// TODO: Implement similar error handling pattern in other services (TaskService, AuthService, etc.)
// Each service should:
// 1. Use AxiosError for type-safe error handling
// 2. Extract error messages from response data
// 3. Provide meaningful fallback messages
import axios, { AxiosError } from 'axios';
import Board from '../models/Board';
import AuthService from './AuthService';

class BoardService {
  http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  private getHeaders() {
    return {
      'x-auth-token': AuthService.getToken(),
    };
  }

  async getBoards() {
    try {
      const res = await this.http.get<Board[]>('/boards', { headers: this.getHeaders() });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch boards');
      }
      throw error;
    }
  }

  async getBoard(id: string) {
    try {
      const res = await this.http.get<Board>(`/boards/${id}`, {
        headers: this.getHeaders(),
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch board');
      }
      throw error;
    }
  }

  async createBoard(data: { name: string }) {
    try {
      const res = await this.http.post<Board>('/boards', data, { headers: this.getHeaders() });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create board');
      }
      throw error;
    }
  }

  async deleteBoard(id: string) {
    try {
      const res = await this.http.delete<Board>(`/boards/${id}`, {
        headers: this.getHeaders(),
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete board');
      }
      throw error;
    }
  }
}

export default new BoardService();
