import axios from 'axios';
import AuthService from './AuthService';

interface CreateColumnDto {
  name: string;
}

class ColumnService {
  http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  private getHeaders() {
    return {
      'x-auth-token': AuthService.getToken(),
    };
  }

  async createColumn(boardId: string, data: CreateColumnDto) {
    const res = await this.http.post(`/boards/${boardId}/columns`, data, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async createColumns(boardId: string, columnNames: string[]) {
    const createPromises = columnNames.map((name) => this.createColumn(boardId, { name }));
    return Promise.all(createPromises);
  }
}

export default new ColumnService();
