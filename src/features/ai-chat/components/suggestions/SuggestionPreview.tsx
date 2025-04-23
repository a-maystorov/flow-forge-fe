import {
  BoardSuggestion,
  SuggestionContent,
  SuggestionType,
  TaskBreakdownSuggestion,
  TaskImprovementSuggestion,
} from '@/models/Suggestion';
import { Box, Card, Group, Badge, Button, Loader, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { BoardSuggestionPreview } from './BoardSuggestionPreview';
import { TaskBreakdownPreview } from './TaskBreakdownPreview';
import { TaskImprovementPreview } from './TaskImprovementPreview';

interface SuggestionPreviewProps {
  type: SuggestionType;
  content: SuggestionContent;
  suggestionId: string;
  isLoading?: boolean;
  onAccept: (suggestionId: string) => void;
  onReject: (suggestionId: string) => void;
}

export function SuggestionPreview({
  type,
  content,
  suggestionId,
  isLoading = false,
  onAccept,
  onReject,
}: SuggestionPreviewProps) {
  const [expanded, setExpanded] = useState(false);

  // Reset expanded state when suggestion changes
  useEffect(() => {
    setExpanded(false);
  }, [suggestionId]);

  if (isLoading) {
    return (
      <Box p="md" ta="center">
        <Loader size="sm" />
        <Text size="xs" c="dimmed" mt="xs">
          Loading suggestion...
        </Text>
      </Box>
    );
  }

  const renderPreview = () => {
    switch (type) {
      case 'board':
        return (
          <BoardSuggestionPreview
            suggestion={content as BoardSuggestion}
            expanded={expanded}
            onToggleExpand={() => setExpanded(!expanded)}
          />
        );
      case 'task-breakdown':
        return (
          <TaskBreakdownPreview
            suggestion={content as TaskBreakdownSuggestion}
            expanded={expanded}
            onToggleExpand={() => setExpanded(!expanded)}
          />
        );
      case 'task-improvement':
        return (
          <TaskImprovementPreview
            suggestion={content as TaskImprovementSuggestion}
            expanded={expanded}
            onToggleExpand={() => setExpanded(!expanded)}
          />
        );
      default:
        return <Text c="dimmed">Unknown suggestion type</Text>;
    }
  };

  // Format the type for display
  const formattedType = type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Box mb="md">
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            AI Suggestion: {formattedType}
          </Text>
          <Badge size="sm" color="blue" variant="light">
            Preview
          </Badge>
        </Group>
      </Box>
      {renderPreview()}
      <Box mt="md" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button onClick={() => onReject(suggestionId)} variant="subtle" color="red" size="xs">
          Reject
        </Button>
        <Button onClick={() => onAccept(suggestionId)} variant="filled" color="green" size="xs">
          Accept
        </Button>
      </Box>
    </Card>
  );
}
