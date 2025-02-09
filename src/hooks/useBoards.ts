import { QueryKey, useQuery } from '@tanstack/react-query';
import ms from 'ms';
import Board from '../models/Board';
import BoardService from '../services/BoardService';

export default function useBoards() {
  const query = useQuery<Board[], Error, Board[], QueryKey>({
    queryKey: ['boards'],
    queryFn: () => BoardService.getBoards(),
    staleTime: ms('1d'),
  });

  return query;
}
