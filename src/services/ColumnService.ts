import axios, { AxiosError } from 'axios';
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
    try {
      const res = await this.http.post(
        `/boards/${boardId}/columns`,
        { name },
        { headers: this.getHeaders() }
      );
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create column');
      }
      throw error;
    }
  }

  async createBatchColumns(boardId: string, columnNames: string[]) {
    try {
      const res = await this.http.post(
        `/boards/${boardId}/columns/batch`,
        { columns: columnNames },
        { headers: this.getHeaders() }
      );
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create columns');
      }
      throw error;
    }
  }
}

export default new ColumnService();
