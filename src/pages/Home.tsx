import { Button, Flex, Title } from '@mantine/core';
import useBoard from '../hooks/useBoard';
import useBoards from '../hooks/useBoards';
import authService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

const BoardsList = () => {
  const { data: boards, error, isLoading } = useBoards();

  console.log('DATA: ', boards);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching boards: {error.message}</div>;
  }

  if (!boards) {
    return null;
  }

  return (
    <div>
      {boards.map((board) => (
        <div key={board._id}>
          <h2>List Name: {board.name}</h2>
          <BoardDetails id={board._id} />
        </div>
      ))}
    </div>
  );
};

const BoardDetails = ({ id }: { id: string }) => {
  const { data: board, isLoading } = useBoard(id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Detail Name: {board?.name}</p>
      <p>OwnerId: {board?.ownerId}</p>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();

  const handleGuestSession = async () => {
    try {
      await authService.createGuestSession();
      navigate('/boards');
    } catch (error) {
      console.error('Error creating guest session:', error);
    }
  };

  return (
    <Flex direction="column" align="center" gap="md">
      <Title>Welcome to Flow Forge</Title>
      <Button onClick={handleGuestSession} variant="light" color="blue">
        Continue as Guest
      </Button>
      <BoardsList />
    </Flex>
  );
};

export default Home;
