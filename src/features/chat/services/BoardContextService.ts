import { authService } from '@/features/auth/services';
import Board from '@/models/Board';
import { BoardContext } from '@/models/BoardContext';
import axios from 'axios';

class BoardContextService {
  http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  private getHeaders() {
    return {
      'x-auth-token': authService.getToken(),
    };
  }

  /**
   * Create a new board from a board context object
   * @param boardContext The board context object containing board structure
   * @param chatId The ID of the chat to associate with the board
   * @returns The newly created board
   */
  async createBoardFromContext(boardContext: BoardContext): Promise<Board> {
    try {
      const res = await this.http.post<{ success: boolean; data: Board; message: string }>(
        '/board-context/create',
        boardContext,
        { headers: this.getHeaders() }
      );
      return res.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing board from context
   * @param boardId The ID of the board to update
   * @param boardContext The board context to update the board with
   * @returns The updated board
   */
  async updateBoardFromContext(boardId: string, boardContext: BoardContext): Promise<Board> {
    try {
      const res = await this.http.put<{ success: boolean; data: Board; message: string }>(
        `/board-context/update/${boardId}`,
        boardContext,
        { headers: this.getHeaders() }
      );
      return res.data.data;
    } catch (error) {
      throw error;
    }
  }
}

export const boardContextService = new BoardContextService();
