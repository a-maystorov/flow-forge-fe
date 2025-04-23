import {
  SuggestionType,
  SuggestionContent,
  BoardSuggestion,
  TaskBreakdownSuggestion,
  TaskImprovementSuggestion,
} from '@/models/Suggestion';
import { Button, Modal, Tabs, Box, Text, LoadingOverlay } from '@mantine/core';
import { FC, useState } from 'react';
import { BoardSuggestionPreview } from './BoardSuggestionPreview';
import { TaskBreakdownPreview } from './TaskBreakdownPreview';
import { TaskImprovementPreview } from './TaskImprovementPreview';

interface SuggestionModalProps {
  opened: boolean;
  onClose: () => void;
  type: SuggestionType;
  content: SuggestionContent;
  suggestionId: string;
  isLoading: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export const SuggestionModal: FC<SuggestionModalProps> = ({
  opened,
  onClose,
  type,
  content,
  suggestionId,
  isLoading,
  onAccept,
  onReject,
}) => {
  // Format the suggestion type for display
  const formattedType = type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const [expanded, setExpanded] = useState(false);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  // Render the appropriate preview component based on the suggestion type
  const renderPreviewContent = () => {
    if (isLoading) return <LoadingOverlay visible />;

    switch (type) {
      case 'board':
        return (
          <BoardSuggestionPreview
            suggestion={content as BoardSuggestion}
            expanded={expanded}
            onToggleExpand={handleToggleExpand}
          />
        );
      case 'task-breakdown':
        return (
          <TaskBreakdownPreview
            suggestion={content as TaskBreakdownSuggestion}
            expanded={expanded}
            onToggleExpand={handleToggleExpand}
          />
        );
      case 'task-improvement':
        return (
          <Tabs defaultValue="improved">
            <Tabs.List>
              <Tabs.Tab value="original">Original Task</Tabs.Tab>
              <Tabs.Tab value="improved">Improved Task</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="original" pt="xs">
              <Box p="md">
                <Text fw={500} mb="xs">
                  {(content as TaskImprovementSuggestion).originalTask.title}
                </Text>
                <Text size="sm">
                  {(content as TaskImprovementSuggestion).originalTask.description}
                </Text>
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="improved" pt="xs">
              <TaskImprovementPreview
                suggestion={content as TaskImprovementSuggestion}
                expanded={expanded}
                onToggleExpand={handleToggleExpand}
              />
            </Tabs.Panel>
          </Tabs>
        );
      default:
        return <Text>No preview available</Text>;
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`AI Suggestion: ${formattedType}`} size="lg">
      <Box style={{ position: 'relative', minHeight: '200px' }}>{renderPreviewContent()}</Box>

      <Box mt="xl" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button onClick={() => onReject(suggestionId)} variant="subtle" color="red">
          Reject
        </Button>
        <Button onClick={() => onAccept(suggestionId)} variant="filled" color="green">
          Accept
        </Button>
      </Box>
    </Modal>
  );
};
