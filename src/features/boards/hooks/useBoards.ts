import { QueryKey, useQuery } from '@tanstack/react-query';
import ms from 'ms';
import { boardService } from '../services';
import type { Board } from '../types';

export function useBoards() {
  const query = useQuery<Board[], Error, Board[], QueryKey>({
    queryKey: ['boards'],
    queryFn: () => boardService.getBoards(),
    staleTime: ms('1d'),
  });

  return {
    boards: query.data,
    isLoading: query.isPending,
    error: query.error?.message,
  };
}
