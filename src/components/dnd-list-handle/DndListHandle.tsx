import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Box, Title, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import cx from 'clsx';
import GripVerticalIcon from '../../assets/icons/GripVerticalIcon';
import Task from '../../models/Task';
import classes from './DndListHandle.module.css';

interface Props {
  tasks: Task[];
}

export function DndListHandle({ tasks }: Props) {
  const { colorScheme } = useMantineColorScheme({ keepTransitions: true });
  const isDarkColorScheme = colorScheme === 'dark';
  const theme = useMantineTheme();

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) => {
        // TODO: Implement task reordering via API
        console.log('Reorder from', source.index, 'to', destination?.index || 0);
      }}
    >
      <Droppable droppableId="dnd-list" direction="vertical">
        {(provided) => (
          <Box {...provided.droppableProps} ref={provided.innerRef}>
            {tasks.map((task, index) => (
              <Draggable key={task._id} index={index} draggableId={task._id}>
                {(provided, snapshot) => (
                  <Box
                    className={cx(classes.item, { [classes.itemDragging]: snapshot.isDragging })}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    bg={isDarkColorScheme ? theme.colors['dark-gray'][0] : theme.colors.white[0]}
                  >
                    <Box {...provided.dragHandleProps} className={classes.dragHandle}>
                      <GripVerticalIcon w={18} h={18} />
                    </Box>

                    <Box>
                      <Title order={3} className={classes.taskTitle}>
                        {task.title}
                      </Title>

                      {task.subtasks.length > 0 && (
                        <Title order={4} c={theme.colors['medium-gray'][0]} mt="xs">
                          Subtasks: {task.subtasks.length}
                        </Title>
                      )}
                    </Box>
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
}
