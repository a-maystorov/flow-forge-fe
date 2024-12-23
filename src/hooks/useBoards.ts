import { QueryKey, useQuery } from '@tanstack/react-query';
import ms from 'ms';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Board from '../models/Board';
import BoardService from '../services/BoardService';

export default function useBoards() {
  const navigate = useNavigate();
  const { boardId } = useParams();

  const query = useQuery<Board[], Error, Board[], QueryKey>({
    queryKey: ['boards'],
    queryFn: () => BoardService.getBoards(),
    staleTime: ms('1d'),
  });

  useEffect(() => {
    if (!boardId && query.data?.length) {
      navigate(`/boards/${query.data[0]._id}`);
    }
  }, [boardId, navigate, query.data]);

  return query;
}
