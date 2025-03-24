import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Box, Stack, Text, Title, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import cx from 'clsx';
import GripVerticalIcon from '../../assets/icons/GripVerticalIcon';
import Task from '../../models/Task';
import classes from './DndListHandle.module.css';

interface Props {
  tasks: Task[];
  columnId: string;
  onTaskClick?: (task: Task) => void;
}

export function DndListHandle({ tasks, columnId, onTaskClick }: Props) {
  const { colorScheme } = useMantineColorScheme({ keepTransitions: true });
  const isDarkColorScheme = colorScheme === 'dark';
  const theme = useMantineTheme();

  return (
    <Droppable droppableId={columnId} direction="vertical">
      {(provided) => (
        <Box {...provided.droppableProps} ref={provided.innerRef}>
          {tasks.map((task, index) => (
            <Draggable key={task._id} draggableId={task._id} index={index}>
              {(provided, snapshot) => (
                <Box
                  {...provided.draggableProps}
                  ref={provided.innerRef}
                  className={cx(classes.item, {
                    [classes.itemDragging]: snapshot.isDragging,
                  })}
                  bg={isDarkColorScheme ? theme.colors['dark-gray'][0] : theme.colors.white[0]}
                  onClick={() => onTaskClick?.(task)}
                >
                  <Box {...provided.dragHandleProps} className={classes.dragHandle}>
                    <GripVerticalIcon w={20} h={20} />
                  </Box>

                  <Stack gap={0}>
                    <Title order={6} fw={500} className={classes.taskTitle}>
                      {task.title}
                    </Title>

                    <Text c="dimmed" fs="italic" hidden={task.subtasks.length === 0}>
                      Subtasks: {task.subtasks.length}
                    </Text>
                  </Stack>
                </Box>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </Box>
      )}
    </Droppable>
  );
}
