import { Button } from '@mantine/core';
import EyeSlashIcon from '../../assets/icons/EyeSlashIcon';
import styles from './HideSidebarButton.module.css';

interface Props {
  onClick: () => void;
}

export default function HideSidebarButton({ onClick }: Props) {
  return (
    <Button
      onClick={onClick}
      variant="transparent"
      leftSection={<EyeSlashIcon w={20} h={20} />}
      classNames={styles}
    >
      Hide Sidebar
    </Button>
  );
}
