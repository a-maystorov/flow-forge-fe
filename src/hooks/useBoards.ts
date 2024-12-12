import { useQuery } from '@tanstack/react-query';
import Board from '../models/Board';
import BoardService from '../services/BoardService';
import ms from 'ms';

const useBoards = () =>
  useQuery<Board[], Error>({
    queryKey: ['boards'],
    queryFn: () => BoardService.getBoards(),
    staleTime: ms('1d'),
  });

export default useBoards;
