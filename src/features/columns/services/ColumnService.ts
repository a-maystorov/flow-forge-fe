import { authService } from '@/features/auth/services';
import axios from 'axios';

class ColumnService {
  private http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  private getHeaders() {
    return {
      'x-auth-token': authService.getToken(),
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
      { columnNames },
      { headers: this.getHeaders() }
    );
    return res.data;
  }
}

export const columnService = new ColumnService();
