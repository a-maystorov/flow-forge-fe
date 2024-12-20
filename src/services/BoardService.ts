import axios from 'axios';
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
    const res = await this.http.get<Board[]>('/boards', { headers: this.getHeaders() });
    return res.data;
  }

  async getBoard(id: string) {
    const res = await this.http.get<Board>('/boards/' + id, { headers: this.getHeaders() });
    return res.data;
  }

  async createBoard(data: { name: string }) {
    const res = await this.http.post<Board>('/boards', data, { headers: this.getHeaders() });
    return res.data;
  }
}

export default new BoardService();
