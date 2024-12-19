import { Flex, Title } from '@mantine/core';
import useBoard from '../hooks/useBoard';
import useBoards from '../hooks/useBoards';

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
  return (
    <Flex direction="column" align="center" justify="center" gap="md" h="100vh">
      <Title>Welcome to Flow Forge</Title>
      <BoardsList />
    </Flex>
  );
};

export default Home;
