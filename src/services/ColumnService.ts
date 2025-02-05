import axios from 'axios';
import AuthService from './AuthService';

class ColumnService {
  http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  private getHeaders() {
    return {
      'x-auth-token': AuthService.getToken(),
    };
  }

  async createColumn(boardId: string, name: string) {
    const res = await this.http.post(
      `/boards/${boardId}/columns`,
      { name },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  async createBatchColumns(boardId: string, columnNames: string[]) {
    const res = await this.http.post(
      `/boards/${boardId}/columns/batch`,
      { columns: columnNames },
      { headers: this.getHeaders() }
    );
    return res.data;
  }
}

export default new ColumnService();
