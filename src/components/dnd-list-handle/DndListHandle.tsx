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

                  <Stack gap={3}>
                    <Title order={3} fw={700} className={classes.taskTitle}>
                      {task.title}
                    </Title>

                    <Text
                      fz={theme.fontSizes.sm}
                      c={theme.colors['medium-gray'][0]}
                      fw={600}
                      hidden={task.subtasks.length === 0}
                    >
                      {task.subtasks.filter((subtask) => subtask.completed).length} of{' '}
                      {task.subtasks.length} subtasks
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
