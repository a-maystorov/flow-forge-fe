import { Button, Flex, MantineSize } from '@mantine/core';
import { CSSProperties, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBoardMutations } from '../../hooks/useBoardMutations';
import DeleteBoardModal from '../modals/DeleteBoardModal';
import { useAuth } from '@/features/auth/hooks';

interface Props {
  size?: MantineSize | `compact-${MantineSize}` | (string & {});
  direction: CSSProperties['flexDirection'];
  gap: CSSProperties['gap'];
}

export default function AuthActions({ direction, size, gap }: Props) {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { boardId } = useParams();
  const { deleteBoard } = useBoardMutations();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteConfirm = () => {
    if (!boardId) {
      return;
    }

    deleteBoard.mutate(boardId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        navigate('/');
      },
    });
  };

  if (isAuthenticated) {
    return (
      <>
        <DeleteBoardModal
          opened={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          loading={deleteBoard.isPending}
        />

        <Flex direction={direction} gap={gap}>
          {boardId && (
            <Button
              size={size}
              variant="outline"
              color="red"
              onClick={() => setIsDeleteModalOpen(true)}
              style={{ flex: 1 }}
            >
              Delete Board
            </Button>
          )}
          <Button size={size} variant="outline" onClick={() => logout()} style={{ flex: 1 }}>
            Logout
          </Button>
        </Flex>
      </>
    );
  }

  return (
    <Flex direction={direction} gap={gap}>
      <Button
        size={size}
        variant="outline"
        component={Link}
        to="/login"
        state={{ from: location }}
        style={{ flex: 1 }}
      >
        Login
      </Button>

      <Button
        size={size}
        component={Link}
        to="/signup"
        state={{ from: location }}
        style={{ flex: 1 }}
      >
        Signup
      </Button>
    </Flex>
  );
}
