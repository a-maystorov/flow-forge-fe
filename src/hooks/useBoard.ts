import { useQuery } from '@tanstack/react-query';
import Board from '../models/Board';
import BoardService from '../services/BoardService';
import ms from 'ms';

const useBoard = (id: string) =>
  useQuery<Board, Error>({
    queryKey: ['board', id],
    queryFn: () => BoardService.getBoard(id),
    staleTime: ms('1d'),
  });

export default useBoard;
