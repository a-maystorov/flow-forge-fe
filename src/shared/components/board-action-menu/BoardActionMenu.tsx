import DotsVerticalIcon from '@/assets/icons/DotsVerticalIcon';
import { useLogout, useUser } from '@/features/auth/hooks';
import { Button, Menu } from '@mantine/core';
import { Link, useLocation, useParams } from 'react-router-dom';

interface AdditionalAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
}

interface Props {
  additionalActions?: AdditionalAction[];
  onDeleteBoard?: () => void;
}

export function BoardActionMenu({ additionalActions = [], onDeleteBoard }: Props) {
  const { isAuthenticated } = useUser();
  const { logout } = useLogout();
  const location = useLocation();
  const { boardId } = useParams();

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <Button variant="subtle" p={0} c="dimmed">
          <DotsVerticalIcon />
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Actions</Menu.Label>

        {isAuthenticated ? (
          <Menu.Item onClick={() => logout()}>Logout</Menu.Item>
        ) : (
          <>
            <Menu.Item component={Link} to="/login" state={{ from: location }}>
              Login
            </Menu.Item>

            <Menu.Item component={Link} to="/signup" state={{ from: location }}>
              Signup
            </Menu.Item>
          </>
        )}

        {additionalActions.map((action, index) => (
          <Menu.Item
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            color={action.color}
          >
            {action.label}
          </Menu.Item>
        ))}

        <Menu.Divider hidden={!boardId} />

        {isAuthenticated && boardId && onDeleteBoard && (
          <Menu.Item color="red" onClick={onDeleteBoard}>
            Delete Board
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
