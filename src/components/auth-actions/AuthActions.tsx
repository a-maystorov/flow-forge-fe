import { useLogout, useUser } from '@/features/auth/hooks';
import { Button, Flex, MantineSize } from '@mantine/core';
import { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Props {
  size?: MantineSize | `compact-${MantineSize}` | (string & {});
  direction: CSSProperties['flexDirection'];
  gap: CSSProperties['gap'];
}

export default function AuthActions({ direction, size, gap }: Props) {
  const location = useLocation();
  const { isAuthenticated } = useUser();
  const { logout } = useLogout();

  if (isAuthenticated) {
    return (
      <Flex direction={direction} gap={gap}>
        <Button size={size} variant="outline" onClick={() => logout()} style={{ flex: 1 }}>
          Logout
        </Button>
      </Flex>
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
