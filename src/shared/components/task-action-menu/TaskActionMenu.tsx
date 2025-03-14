import DotsVerticalIcon from '@/assets/icons/DotsVerticalIcon';
import { Button, Menu } from '@mantine/core';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskActionMenu({ onEdit, onDelete }: Props) {
  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <Button variant="subtle" p={0} c="dimmed">
          <DotsVerticalIcon />
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Actions</Menu.Label>
        <Menu.Item onClick={onEdit}>Edit</Menu.Item>
        <Menu.Item color="red" onClick={onDelete}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
