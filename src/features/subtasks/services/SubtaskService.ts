import { authService } from '@/features/auth/services';
import Subtask from '@/models/Subtask';
import axios, { AxiosInstance } from 'axios';

export class SubtaskService {
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

  async createSubtask(
    boardId: string,
    columnId: string,
    taskId: string,
    subtaskData: {
      title: string;
      description?: string;
      completed?: boolean;
    }
  ): Promise<Subtask> {
    const res = await this.http.post<Subtask>(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/subtasks`,
      subtaskData,
      {
        headers: this.getHeaders(),
      }
    );
    return res.data;
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

  async updateSubtask(
    boardId: string,
    columnId: string,
    taskId: string,
    subtaskId: string,
    updates: {
      title: string;
      description?: string;
      completed: boolean;
    }
  ): Promise<Subtask> {
    const res = await this.http.put<Subtask>(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/subtasks/${subtaskId}`,
      updates,
      {
        headers: this.getHeaders(),
      }
    );
    return res.data;
  }

  async deleteSubtask(
    boardId: string,
    columnId: string,
    taskId: string,
    subtaskId: string
  ): Promise<void> {
    await this.http.delete(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/subtasks/${subtaskId}`,
      {
        headers: this.getHeaders(),
      }
    );
  }
}

export const subtaskService = new SubtaskService();
