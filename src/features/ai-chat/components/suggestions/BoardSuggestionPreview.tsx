import { BoardSuggestion } from '@/models/Suggestion';
import { Badge, Box, Button, Collapse, Group, Text } from '@mantine/core';
import DOMPurify from 'dompurify';

interface Props {
  suggestion: BoardSuggestion;
  expanded: boolean;
  onToggleExpand: () => void;
}

export function BoardSuggestionPreview({ suggestion, expanded, onToggleExpand }: Props) {
  const { boardName, columns } = suggestion;
  const tasksCount = columns.reduce((count, column) => count + column.tasks.length, 0);

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Text fw={500}>{boardName}</Text>
        <Button variant="subtle" size="compact-sm" onClick={onToggleExpand}>
          {expanded ? 'Show Less' : 'Show More'}
        </Button>
      </Group>

      <Group gap="xs" mb="md">
        <Badge color="blue">{columns.length} Columns</Badge>
        <Badge color="green">{tasksCount} Tasks</Badge>
      </Group>

      <Box
        mb="md"
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          padding: '5px',
        }}
      >
        {[...columns]
          .sort((a, b) => a.position - b.position)
          .map((column) => (
            <Box
              key={column.name}
              style={{
                minWidth: '100px',
                backgroundColor: 'var(--mantine-color-gray-1)',
                borderRadius: '5px',
                padding: '8px',
                flexShrink: 0,
              }}
            >
              <Text size="xs" fw={500} mb="xs">
                {column.name}
              </Text>
              {[...column.tasks]
                .sort((a, b) => a.position - b.position)
                .slice(0, expanded ? undefined : 3)
                .map((task) => (
                  <Box
                    key={task.id}
                    style={{
                      backgroundColor: 'white',
                      padding: '6px',
                      borderRadius: '3px',
                      marginBottom: '5px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Text size="xs" truncate>
                      {task.title}
                    </Text>
                  </Box>
                ))}

              {!expanded && column.tasks.length > 3 && (
                <Text size="xs" c="dimmed" ta="center">
                  + {column.tasks.length - 3} more
                </Text>
              )}
            </Box>
          ))}
      </Box>

      <Collapse in={expanded}>
        <Box p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Text size="sm" fw={500} mb="xs">
            Board Structure:
          </Text>
          {columns.map((column) => (
            <Box key={column.name} mb="sm">
              <Text size="sm">
                {column.name} - {column.tasks.length} tasks
              </Text>
              <Box ml="md" mt="xs">
                {column.tasks.map((task) => (
                  <Box key={task.id} mb="xs">
                    <Text size="xs" fw={500}>
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text
                        size="xs"
                        c="dimmed"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(task.description),
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
