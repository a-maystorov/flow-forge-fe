import { useBoard } from '@/features/boards/hooks/useBoard';
import { useUpdateBoard } from '@/features/boards/hooks/useUpdateBoard';
import { useUpdateColumn } from '@/features/columns/hooks';
import { Button, Flex, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';

interface FormValues {
  boardName: string;
  columnName: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export function UpdateBoardModal({ isOpen, onClose, boardId }: Props) {
  const { board } = useBoard(boardId);
  const { updateBoard, isUpdatingBoard } = useUpdateBoard(boardId);
  const { updateColumn, isUpdatingColumn } = useUpdateColumn(boardId);

  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      boardName: '',
      columnName: '',
    },
  });

  useEffect(() => {
    if (board) {
      form.setFieldValue('boardName', board.name);
      if (selectedColumnId) {
        const selectedColumn = board.columns.find((col) => col._id === selectedColumnId);
        if (selectedColumn) {
          form.setFieldValue('columnName', selectedColumn.name);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, selectedColumnId]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedColumnId(null);
    }
  }, [isOpen]);

  const handleModalClose = () => {
    form.reset();
    setSelectedColumnId(null);
    onClose();
  };

  const handleColumnChange = (columnId: string | null) => {
    setSelectedColumnId(columnId);

    if (columnId && board) {
      const selectedColumn = board.columns.find((col) => col._id === columnId);
      if (selectedColumn) {
        form.setFieldValue('columnName', selectedColumn.name);
      }
    } else {
      form.setFieldValue('columnName', '');
    }
  };

  const handleFormSubmit = (values: FormValues) => {
    if (board && values.boardName !== board.name) {
      updateBoard({ id: board._id, name: values.boardName });
    }
    if (selectedColumnId) {
      const selectedColumn = board?.columns.find((col) => col._id === selectedColumnId);
      if (selectedColumn && values.columnName !== selectedColumn.name) {
        updateColumn({ columnId: selectedColumnId, name: values.columnName });
      }
    }

    handleModalClose();
  };

  const columnOptions = board?.columns
    ? board.columns.map((column) => ({
        value: column._id,
        label: column.name,
      }))
    : [];

  return (
    <Modal opened={isOpen} onClose={handleModalClose} title="Update Board" size="md">
      <form onSubmit={form.onSubmit(handleFormSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Board Name"
            placeholder="Enter board name"
            {...form.getInputProps('boardName')}
            data-autofocus
          />

          {columnOptions.length > 0 && (
            <Select
              label="Select Column to Edit"
              placeholder="Choose a column"
              data={columnOptions}
              value={selectedColumnId}
              onChange={handleColumnChange}
              clearable
            />
          )}

          {selectedColumnId && (
            <TextInput
              label="Column Name"
              placeholder="Enter column name"
              {...form.getInputProps('columnName')}
            />
          )}

          <Flex mt="md" gap="lg">
            <Button variant="outline" onClick={handleModalClose} type="button" fullWidth>
              Cancel
            </Button>
            <Button type="submit" loading={isUpdatingBoard || isUpdatingColumn} fullWidth>
              Save Changes
            </Button>
          </Flex>
        </Stack>
      </form>
    </Modal>
  );
}
