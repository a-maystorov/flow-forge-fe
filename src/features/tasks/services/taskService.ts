import { authService } from '@/features/auth/services';
import Task from '@/models/Task';
import axios from 'axios';

class TaskService {
  private http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  private getHeaders() {
    return {
      'x-auth-token': authService.getToken(),
    };
  }

  async createTask(
    boardId: string,
    columnId: string,
    data: { title: string; description?: string }
  ) {
    const res = await this.http.post<Task>(`/boards/${boardId}/columns/${columnId}/tasks`, data, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async updateTask(
    boardId: string,
    columnId: string,
    taskId: string,
    data: { title: string; description?: string }
  ): Promise<Task> {
    const res = await this.http.put<Task>(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}`,
      data,
      {
        headers: this.getHeaders(),
      }
    );
    return res.data;
  }

  async deleteTask(boardId: string, columnId: string, taskId: string) {
    await this.http.delete(`/boards/${boardId}/columns/${columnId}/tasks/${taskId}`, {
      headers: this.getHeaders(),
    });
  }

  async reorderTask(boardId: string, columnId: string, taskId: string, newPosition: number) {
    const res = await this.http.patch<Task>(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/reorder`,
      { newPosition },
      {
        headers: this.getHeaders(),
      }
    );
    return res.data;
  }

  async moveTask(
    boardId: string,
    columnId: string,
    taskId: string,
    targetColumnId: string
  ): Promise<Task> {
    const res = await this.http.patch<Task>(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/move`,
      { targetColumnId },
      {
        headers: this.getHeaders(),
      }
    );
    return res.data;
  }
}

export const taskService = new TaskService();
