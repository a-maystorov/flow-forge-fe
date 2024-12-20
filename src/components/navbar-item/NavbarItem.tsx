import { NavLink, Title } from '@mantine/core';
import { useState } from 'react';
import SplitBoardIcon from '../../assets/icons/SplitBoardIcon';
import styles from './NavbarItem.module.css';

interface Props {
  name: string;
}

export default function NavbarItem({ name }: Props) {
  const [active, setActive] = useState(false);

  return (
    <NavLink
      href="#"
      label={<Title order={3}>{name}</Title>}
      active={active}
      onClick={() => setActive(!active)} // Testing purpose only.
      leftSection={<SplitBoardIcon h={16} w={16} />}
      classNames={styles}
      py="md"
      px={{ base: '2lg', md: 'xl' }}
    />
  );
}
