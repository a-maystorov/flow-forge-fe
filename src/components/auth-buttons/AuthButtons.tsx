import { Button, Flex, MantineSize } from '@mantine/core';
import { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

interface Props {
  size?: MantineSize | `compact-${MantineSize}` | (string & {});
  direction: CSSProperties['flexDirection'];
  gap: CSSProperties['gap'];
}

export default function AuthButtons({ direction, size, gap }: Props) {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    return (
      <Button size={size} variant="outline" onClick={logout} fullWidth>
        Logout
      </Button>
    );
  }

  return (
    <Flex direction={direction} gap={gap}>
      <Button size={size} variant="outline" component={Link} to="/login" state={{ from: location }}>
        Login
      </Button>

      <Button size={size} component={Link} to="/signup" state={{ from: location }}>
        Signup
      </Button>
    </Flex>
  );
}
