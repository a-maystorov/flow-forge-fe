import { NavLink as MantineNavLink, Title } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import SplitBoardIcon from '../../assets/icons/SplitBoardIcon';
import styles from './NavbarItem.module.css';

interface Props {
  name: string;
  id: string;
}

export default function NavbarItem({ name, id }: Props) {
  const location = useLocation();
  const isActive = location.pathname === `/boards/${id}`;

  return (
    <MantineNavLink
      component={Link}
      to={`/boards/${id}`}
      label={<Title order={3}>{name}</Title>}
      active={isActive}
      leftSection={<SplitBoardIcon h={16} w={16} />}
      classNames={styles}
      py="md"
      px={{ base: '2lg', md: 'xl' }}
    />
  );
}
