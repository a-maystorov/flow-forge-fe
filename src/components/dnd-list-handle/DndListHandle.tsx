import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Box, Title, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import cx from 'clsx';
import GripVerticalIcon from '../../assets/icons/GripVerticalIcon';
import Task from '../../models/Task';
import classes from './DndListHandle.module.css';

interface Props {
  tasks: Task[];
  columnId: string;
}

export function DndListHandle({ tasks, columnId }: Props) {
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
                >
                  <Box {...provided.dragHandleProps} className={classes.dragHandle}>
                    <GripVerticalIcon w={20} h={20} />
                  </Box>
                  <Title order={6} fw={500} className={classes.taskTitle}>
                    {task.title}
                  </Title>
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
