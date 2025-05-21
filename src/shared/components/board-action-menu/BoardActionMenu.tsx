import DotsVerticalIcon from '@/assets/icons/DotsVerticalIcon';
import TempUserLogoutModal from '@/components/modals/TempUserLogoutModal';
import { ConvertAccountModal } from '@/components/temporary-account-banner';
import { useLogout, useUser } from '@/features/auth/hooks';
import { Button, Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
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
  const { user, isAuthenticated } = useUser();
  const { logout } = useLogout();
  const [convertModalOpened, convertModalHandlers] = useDisclosure(false);
  const [logoutModalOpened, logoutModalHandlers] = useDisclosure(false);

  // Check if user is a temporary user (via isTemporary flag from JWT)
  const isTemporaryUser = user?.isTemporary;
  const location = useLocation();
  const { boardId } = useParams();

  // Handler for confirming logout
  const handleConfirmLogout = () => {
    logoutModalHandlers.close();
    logout();
  };

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
          <>
            {isTemporaryUser && (
              <Menu.Item onClick={convertModalHandlers.open} color="blue">
                Convert to Permanent Account
              </Menu.Item>
            )}
            <Menu.Item onClick={() => (isTemporaryUser ? logoutModalHandlers.open() : logout())}>
              Logout
            </Menu.Item>
          </>
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

      {isTemporaryUser && (
        <>
          <ConvertAccountModal opened={convertModalOpened} onClose={convertModalHandlers.close} />
          <TempUserLogoutModal
            opened={logoutModalOpened}
            onClose={logoutModalHandlers.close}
            onConfirm={handleConfirmLogout}
          />
        </>
      )}
    </Menu>
  );
}
