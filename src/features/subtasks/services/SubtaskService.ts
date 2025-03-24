import { authService } from '@/features/auth/services';
import Subtask from '@/models/Subtask';
import axios, { AxiosInstance } from 'axios';

class SubtaskService {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
    });
  }

  private getHeaders() {
    return {
      'x-auth-token': authService.getToken(),
    };
  }

  async createBatchSubtasks(
    boardId: string,
    columnId: string,
    taskId: string,
    subtaskTitles: string[]
  ): Promise<Subtask[]> {
    const res = await this.http.post<Subtask[]>(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/subtasks/batch`,
      {
        subtasks: subtaskTitles,
      },
      {
        headers: this.getHeaders(),
      }
    );
    return res.data;
  }
}

export const subtaskService = new SubtaskService();
