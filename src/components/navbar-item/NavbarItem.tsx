import { NavLink, Title } from '@mantine/core';
import { useState } from 'react';
import SplitBoardIcon from '../../assets/icons/SplitBoardIcon';
import styles from './NavbarItem.module.css';

export default function NavbarItem() {
  const [active, setActive] = useState(false);

  return (
    <NavLink
      href="#"
      label={<Title order={3}>Navbar Item</Title>}
      active={active}
      onClick={() => setActive(!active)} // Testing purpose only.
      leftSection={<SplitBoardIcon h={16} w={16} />}
      classNames={styles}
      py="md"
      px={{ base: '2lg', md: 'xl' }}
    />
  );
}
