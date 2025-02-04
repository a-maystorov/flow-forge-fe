import axios from 'axios';
import AuthService from './AuthService';

interface CreateTaskDto {
  title: string;
  description?: string;
}

interface UpdateTaskDto {
  title?: string;
  description?: string;
}

class TaskService {
  http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  private getHeaders() {
    return {
      'x-auth-token': AuthService.getToken(),
    };
  }

  async createTask(boardId: string, columnId: string, data: CreateTaskDto) {
    const res = await this.http.post(`/boards/${boardId}/columns/${columnId}/tasks`, data, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async updateTask(boardId: string, columnId: string, taskId: string, data: UpdateTaskDto) {
    const res = await this.http.put(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}`,
      data,
      {
        headers: this.getHeaders(),
      }
    );
    return res.data;
  }

  async deleteTask(boardId: string, columnId: string, taskId: string) {
    const res = await this.http.delete(`/boards/${boardId}/columns/${columnId}/tasks/${taskId}`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async reorderTask(boardId: string, columnId: string, taskId: string, newPosition: number) {
    const res = await this.http.patch(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/reorder`,
      { newPosition },
      {
        headers: this.getHeaders(),
      }
    );
    return res.data;
  }

  async moveTask(boardId: string, columnId: string, taskId: string, targetColumnId: string) {
    const res = await this.http.patch(
      `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/move`,
      { targetColumnId },
      {
        headers: this.getHeaders(),
      }
    );
    return res.data;
  }
}

export default new TaskService();
