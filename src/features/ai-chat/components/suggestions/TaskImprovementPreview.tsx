import { TaskImprovementSuggestion } from '@/models/Suggestion';
import { Box, Button, Collapse, Group, Tabs, Text } from '@mantine/core';
import DOMPurify from 'dompurify';

interface Props {
  suggestion: TaskImprovementSuggestion;
  expanded: boolean;
  onToggleExpand: () => void;
}

export function TaskImprovementPreview({ suggestion, expanded, onToggleExpand }: Props) {
  const { originalTask, improvedTask, reasoning } = suggestion;

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Text fw={500}>Task Improvement</Text>
        <Button variant="subtle" size="compact-sm" onClick={onToggleExpand}>
          {expanded ? 'Show Less' : 'Show More'}
        </Button>
      </Group>

      {/* Reasoning summary - always visible */}
      <Box mb="md">
        <Text size="sm" fw={500} mb="xs">
          Improvement Reasoning:
        </Text>
        <Text size="sm" lineClamp={expanded ? undefined : 2}>
          {reasoning}
        </Text>
      </Box>

      {/* Tabs for comparing original and improved versions */}
      <Tabs defaultValue="compare" mb="md">
        <Tabs.List>
          <Tabs.Tab value="compare">Compare</Tabs.Tab>
          <Tabs.Tab value="original">Original</Tabs.Tab>
          <Tabs.Tab value="improved">Improved</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="compare" pt="xs">
          <Box
            style={{
              display: 'flex',
              gap: '10px',
              flexDirection: expanded ? 'row' : 'column',
            }}
          >
            {/* Original task */}
            <Box
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: 'var(--mantine-color-gray-1)',
                borderRadius: '5px',
              }}
            >
              <Text size="xs" c="dimmed" mb="xs">
                ORIGINAL
              </Text>
              <Text size="sm" fw={500}>
                {originalTask.title}
              </Text>
              <Text
                size="xs"
                lineClamp={expanded ? undefined : 3}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(originalTask.description),
                }}
              />
            </Box>

            {/* Improved task */}
            <Box
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: 'var(--mantine-color-blue-0)',
                borderRadius: '5px',
              }}
            >
              <Text size="xs" c="blue" mb="xs">
                IMPROVED
              </Text>
              <Text size="sm" fw={500}>
                {improvedTask.title}
              </Text>
              <Text
                size="xs"
                lineClamp={expanded ? undefined : 3}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(improvedTask.description),
                }}
              />
            </Box>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="original" pt="xs">
          <Box
            p="xs"
            style={{ backgroundColor: 'var(--mantine-color-gray-1)', borderRadius: '5px' }}
          >
            <Text size="sm" fw={500} mb="xs">
              {originalTask.title}
            </Text>
            <Text
              size="sm"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(originalTask.description),
              }}
            />
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="improved" pt="xs">
          <Box
            p="xs"
            style={{ backgroundColor: 'var(--mantine-color-blue-0)', borderRadius: '5px' }}
          >
            <Text size="sm" fw={500} mb="xs">
              {improvedTask.title}
            </Text>
            <Text
              size="sm"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(improvedTask.description),
              }}
            />
          </Box>
        </Tabs.Panel>
      </Tabs>

      {/* Expandable detailed reasoning */}
      <Collapse in={expanded}>
        <Box p="xs" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Text size="sm" fw={500} mb="xs">
            Detailed Reasoning:
          </Text>
          <Text
            size="sm"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(reasoning),
            }}
          />
        </Box>
      </Collapse>
    </Box>
  );
}
