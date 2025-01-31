import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Box, Text } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import cx from 'clsx';
import GripVerticalIcon from '../../assets/icons/GripVerticalIcon';
import Task from '../../models/Task';
import classes from './DndListHandle.module.css';

interface Props {
  tasks: Task[];
}

export function DndListHandle({ tasks }: Props) {
  const [state, handlers] = useListState(tasks);

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) =>
        handlers.reorder({ from: source.index, to: destination?.index || 0 })
      }
    >
      <Droppable droppableId="dnd-list" direction="vertical">
        {(provided) => (
          <Box {...provided.droppableProps} ref={provided.innerRef}>
            {state.map((task, index) => (
              <Draggable key={task._id} index={index} draggableId={task._id}>
                {(provided, snapshot) => (
                  <Box
                    className={cx(classes.item, { [classes.itemDragging]: snapshot.isDragging })}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <Box {...provided.dragHandleProps} className={classes.dragHandle}>
                      <GripVerticalIcon w={18} h={18} />
                    </Box>

                    <Box>
                      <Text>{task.title}</Text>

                      {task.subtasks.length > 0 && (
                        <Text c="dimmed" size="sm">
                          Subtasks: {task.subtasks.length}
                        </Text>
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
