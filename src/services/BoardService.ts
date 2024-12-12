import axios from 'axios';
import Board from '../models/Board';
import AuthService from './AuthService';

const headers = {
  'x-auth-token': AuthService.getToken(),
};

class BoardService {
  http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  async getBoards() {
    const res = await this.http.get<Board[]>('/boards', { headers });
    return res.data;
  }

  async getBoard(id: string) {
    const res = await this.http.get<Board>('/boards/' + id, { headers });
    return res.data;
  }
}

export default new BoardService();
