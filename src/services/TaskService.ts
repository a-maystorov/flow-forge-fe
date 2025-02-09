import axios, { AxiosError } from 'axios';
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
    try {
      const res = await this.http.post(`/boards/${boardId}/columns/${columnId}/tasks`, data, {
        headers: this.getHeaders(),
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create task');
      }
      throw error;
    }
  }

  async updateTask(boardId: string, columnId: string, taskId: string, data: UpdateTaskDto) {
    try {
      const res = await this.http.put(
        `/boards/${boardId}/columns/${columnId}/tasks/${taskId}`,
        data,
        {
          headers: this.getHeaders(),
        }
      );
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update task');
      }
      throw error;
    }
  }

  async deleteTask(boardId: string, columnId: string, taskId: string) {
    try {
      const res = await this.http.delete(`/boards/${boardId}/columns/${columnId}/tasks/${taskId}`, {
        headers: this.getHeaders(),
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete task');
      }
      throw error;
    }
  }

  async reorderTask(boardId: string, columnId: string, taskId: string, newPosition: number) {
    try {
      const res = await this.http.patch(
        `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/reorder`,
        { newPosition },
        {
          headers: this.getHeaders(),
        }
      );
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to reorder task');
      }
      throw error;
    }
  }

  async moveTask(boardId: string, columnId: string, taskId: string, targetColumnId: string) {
    try {
      const res = await this.http.patch(
        `/boards/${boardId}/columns/${columnId}/tasks/${taskId}/move`,
        { targetColumnId },
        {
          headers: this.getHeaders(),
        }
      );
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to move task');
      }
      throw error;
    }
  }
}

export default new TaskService();
