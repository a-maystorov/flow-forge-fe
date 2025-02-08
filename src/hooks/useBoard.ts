import { useQuery, useQueryClient } from '@tanstack/react-query';
import ms from 'ms';
import Board from '../models/Board';
import BoardService from '../services/BoardService';

export default function useBoard(boardId: string) {
  const queryClient = useQueryClient();

  return useQuery<Board | null, Error>({
    queryKey: ['board', boardId],
    queryFn: () => BoardService.getBoard(boardId),
    enabled: !!boardId && queryClient.getQueryData(['board', boardId]) !== null,
    staleTime: ms('1d'),
    initialData: () => {
      const boards = queryClient.getQueryData<Board[]>(['boards']);
      return boards?.find((b) => b._id === boardId) || null;
    },
  });
}
