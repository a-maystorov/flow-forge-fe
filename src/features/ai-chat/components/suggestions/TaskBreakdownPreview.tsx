import { TaskBreakdownSuggestion } from '@/models/Suggestion';
import { Badge, Box, Button, Collapse, Group, Progress, Text } from '@mantine/core';
import DOMPurify from 'dompurify';

interface Props {
  suggestion: TaskBreakdownSuggestion;
  expanded: boolean;
  onToggleExpand: () => void;
}

export function TaskBreakdownPreview({ suggestion, expanded, onToggleExpand }: Props) {
  const { taskTitle, taskDescription, subtasks } = suggestion;

  // Calculate statistics
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((subtask) => subtask.completed).length;
  const progressPercentage =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Text fw={500}>Task Breakdown</Text>
        <Button variant="subtle" size="compact-sm" onClick={onToggleExpand}>
          {expanded ? 'Show Less' : 'Show More'}
        </Button>
      </Group>

      {/* Task information */}
      <Text fw={500}>{taskTitle}</Text>

      {/* Stats summary - always visible */}
      <Group gap="xs" mb="md" mt="xs">
        <Badge color="blue">{totalSubtasks} Subtasks</Badge>
        <Badge color={completedSubtasks > 0 ? 'green' : 'gray'}>
          {completedSubtasks} Completed
        </Badge>
      </Group>

      {/* Progress bar for task completion */}
      <Box mb="md">
        <Text size="xs" mb="xs">
          Overall Progress
        </Text>
        <Progress
          value={progressPercentage}
          size="sm"
          color={progressPercentage > 0 ? 'green' : 'gray'}
        />
      </Box>

      {/* Preview of the subtasks - simplified view */}
      <Box
        mb="md"
        style={{
          backgroundColor: 'var(--mantine-color-gray-1)',
          borderRadius: '5px',
          padding: '10px',
        }}
      >
        <Text size="sm" fw={500} mb="xs">
          {taskTitle}
        </Text>

        {/* Show first few subtasks in collapsed view */}
        {subtasks.slice(0, expanded ? undefined : 3).map((subtask) => (
          <Box
            key={subtask.id}
            style={{
              backgroundColor: 'white',
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '8px',
              marginLeft: '15px',
              borderLeft: `2px solid var(--mantine-color-${subtask.completed ? 'green' : 'blue'}-5)`,
            }}
          >
            <Group gap="xs" align="center">
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  backgroundColor: subtask.completed
                    ? 'var(--mantine-color-green-5)'
                    : 'var(--mantine-color-gray-3)',
                }}
              />
              <Text size="sm">{subtask.title}</Text>
            </Group>

            {expanded && subtask.description && (
              <Text
                size="xs"
                c="dimmed"
                mt="xs"
                ml="18px"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(subtask.description),
                }}
              />
            )}
          </Box>
        ))}

        {/* Show message if there are more subtasks */}
        {!expanded && subtasks.length > 3 && (
          <Text size="xs" c="dimmed" ta="center" mt="xs">
            + {subtasks.length - 3} more subtasks
          </Text>
        )}
      </Box>

      {/* Expandable detailed description */}
      <Collapse in={expanded}>
        {taskDescription ? (
          <Box p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
            <Text size="sm" fw={500} mb="xs">
              Task Description:
            </Text>
            <Text
              size="sm"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(taskDescription),
              }}
            />
          </Box>
        ) : null}
      </Collapse>
    </Box>
  );
}
