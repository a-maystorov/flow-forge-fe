import { Button } from '@mantine/core';
import EyeIcon from '../../assets/icons/EyeIcon';
import styles from './ShowSidebarButton.module.css';

interface Props {
  onClick: () => void;
}

export default function ShowSidebarButton({ onClick }: Props) {
  return (
    <Button
      onClick={onClick}
      radius={0}
      w={56}
      h={48}
      className={styles['show-sidebar-button']}
      aria-label="Toggle navigation"
    >
      <EyeIcon w={24} h={24} />
    </Button>
  );
}
