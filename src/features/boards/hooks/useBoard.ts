import Board from '@/models/Board';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ms from 'ms';
import { boardService } from '../services';

export function useBoard(boardId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<Board, Error>({
    queryKey: ['board', boardId],
    queryFn: () => {
      if (!boardId) {
        throw new Error('Board ID is required');
      }
      return boardService.getBoard(boardId);
    },
    enabled: !!boardId,
    staleTime: ms('1d'),
    initialData: () => {
      if (!boardId) {
        return undefined;
      }
      const boards = queryClient.getQueryData<Board[]>(['boards']);
      return boards?.find((b) => b._id === boardId);
    },
  });

  return {
    board: query.data,
    isFetchingBoard: query.isPending,
    isError: query.isError,
    error: query.error,
  };
}
