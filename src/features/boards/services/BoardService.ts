import axios, { AxiosError } from 'axios';
import { authService } from '@/features/auth/services';
import type { Board, BoardInput } from '../types';

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

  async createBoard(data: BoardInput) {
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

  async updateBoard(id: string, data: BoardInput) {
    try {
      const res = await this.http.put<Board>(`/boards/${id}`, data, {
        headers: this.getHeaders(),
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update board');
      }
      throw error;
    }
  }

  async deleteBoard(id: string) {
    try {
      await this.http.delete(`/boards/${id}`, { headers: this.getHeaders() });
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete board');
      }
      throw error;
    }
  }
}

export const boardService = new BoardService();
