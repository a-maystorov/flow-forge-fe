import TempUserLogoutModal from '@/components/modals/TempUserLogoutModal';
import { ConvertAccountModal } from '@/components/temporary-account-banner';
import { useLogout, useUser } from '@/features/auth/hooks';
import { Button, Flex, MantineSize } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Props {
  size?: MantineSize | `compact-${MantineSize}` | (string & {});
  direction: CSSProperties['flexDirection'];
  gap: CSSProperties['gap'];
}

// TODO: Combine this with BoardActionMenu to avoid duplicate code
export default function AuthActions({ direction, size, gap }: Props) {
  const location = useLocation();
  const { user, isAuthenticated } = useUser();
  const { logout } = useLogout();
  const [logoutModalOpened, logoutModalHandlers] = useDisclosure(false);
  const [convertModalOpened, convertModalHandlers] = useDisclosure(false);

  const isTemporaryUser = user?.isTemporary;

  const handleConfirmLogout = () => {
    logoutModalHandlers.close();
    logout();
  };

  if (isAuthenticated) {
    return (
      <>
        <Flex direction={direction} gap={gap}>
          {isTemporaryUser && (
            <Button
              size={size}
              variant="light"
              color="blue"
              onClick={convertModalHandlers.open}
              style={{ flex: 1 }}
              mb="md"
              py="md"
            >
              Convert Account
            </Button>
          )}

          <Button
            size={size}
            variant="outline"
            onClick={isTemporaryUser ? logoutModalHandlers.open : () => logout()}
            style={{ flex: 1 }}
            py="md"
          >
            Logout
          </Button>
        </Flex>

        {isTemporaryUser && (
          <>
            <TempUserLogoutModal
              opened={logoutModalOpened}
              onClose={logoutModalHandlers.close}
              onConfirm={handleConfirmLogout}
            />
            <ConvertAccountModal opened={convertModalOpened} onClose={convertModalHandlers.close} />
          </>
        )}
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
        py="md"
      >
        Login
      </Button>

      <Button
        size={size}
        component={Link}
        to="/signup"
        state={{ from: location }}
        style={{ flex: 1 }}
        py="md"
      >
        Signup
      </Button>
    </Flex>
  );
}
