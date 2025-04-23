import RobotIcon from '@/assets/icons/RobotIcon';
import UserIcon from '@/assets/icons/UserIcon';
import { ChatMessage as ChatMessageType } from '@/models/ChatMessage';
import { SuggestionType } from '@/models/Suggestion';
import { Avatar, Badge, Box, Button, Card, Group, Text } from '@mantine/core';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';
import { useMemo, useState } from 'react';
import { chatService } from '../services';
import { SuggestionModal } from './suggestions/SuggestionModal';

interface Props {
  message: ChatMessageType;
  onAcceptSuggestion?: (suggestionId: string) => void;
  onRejectSuggestion?: (suggestionId: string) => void;
}

// Function to detect if message contains a suggestion
const detectSuggestion = (content: string, role: string) => {
  // Only assistant messages can be suggestions
  if (role !== 'assistant') return false;

  // Simple check - look for Accept/Reject links or board structure keywords
  const hasSuggestionMarkers =
    (content.includes('[Accept Suggestion]') && content.includes('[Reject Suggestion]')) ||
    content.includes('Board Structure:') ||
    (content.includes('Would you like to use this') &&
      (content.includes('board') ||
        content.includes('breakdown') ||
        content.includes('improvement')));

  // Check for API endpoints that indicate suggestion actions
  const hasApiEndpoints = content.includes('/suggestions/');

  return hasSuggestionMarkers && hasApiEndpoints;
};

// Extract suggestion ID from content
const extractSuggestionId = (content: string) => {
  const match = content.match(/\/suggestions\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
};

// Extract suggestion type based on content patterns
const determineSuggestionType = (content: string) => {
  if (content.includes('board layout') || content.includes('Board Layout')) {
    return 'board';
  } else if (content.includes('breakdown') || content.includes('Breakdown')) {
    return 'task-breakdown';
  } else if (content.includes('improvement') || content.includes('Improvement')) {
    return 'task-improvement';
  }
  return 'board'; // Default fallback
};

// Parse the suggestion content to extract relevant data
const parseSuggestionContent = (content: string, type: string) => {
  // Extract title and items from the content
  const lines = content.split('\n');
  let title = '';
  const items = [];

  // Extract title from first line - look for patterns in your message
  if (lines.length > 0) {
    const titleMatch = lines[0].match(/Here's a (.+) for "(.*?)":/);
    if (titleMatch && titleMatch[2]) {
      title = titleMatch[2];
    } else if (lines[0].includes('board layout for')) {
      const simpleMatch = lines[0].match(/board layout for "(.*?)"/);
      if (simpleMatch && simpleMatch[1]) {
        title = simpleMatch[1];
      } else {
        title = 'Board Suggestion';
      }
    }
  }

  // Extract items from the message content
  let inItemSection = false;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and action buttons
    if (!line || line.includes('[Accept Suggestion]') || line.includes('[Reject Suggestion]')) {
      continue;
    }

    // Detect list items and sections
    if (line.startsWith('**') && line.endsWith('**')) {
      inItemSection = true;
      items.push({
        name: line.replace(/\*\*/g, ''),
        content: [] as string[],
      });
    } else if (inItemSection && items.length > 0) {
      // Add content to the current section
      items[items.length - 1].content.push(line);
    }
  }

  // Create appropriate suggestion content based on type
  if (type === 'board') {
    return {
      boardName: title,
      columns: items.map((item, index) => ({
        name: item.name,
        position: index,
        tasks: item.content.map((task, taskIndex) => ({
          id: `task-${index}-${taskIndex}`,
          title: task,
          description: '',
          position: taskIndex,
        })),
      })),
    };
  } else if (type === 'task-breakdown') {
    return {
      taskTitle: title,
      taskDescription: 'Task breakdown from AI suggestion',
      subtasks: items.flatMap((item) =>
        item.content.map((task, index) => ({
          id: `subtask-${index}`,
          title: task,
          description: '',
          completed: false,
        }))
      ),
    };
  } else {
    // Task improvement
    return {
      originalTask: {
        title: 'Original Task',
        description: 'Original task description',
      },
      improvedTask: {
        title: title || 'Improved Task',
        description: items.flatMap((item) => item.content).join('\n'),
      },
      reasoning: 'AI suggested improvements to make the task more clear and actionable.',
    };
  }
};

export default function ChatMessage({ message, onAcceptSuggestion, onRejectSuggestion }: Props) {
  const isUser = message.role === 'user';
  const [suggestionAccepted, setSuggestionAccepted] = useState(false);
  const [suggestionRejected, setSuggestionRejected] = useState(false);
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);

  // Format the creation date for display
  const formattedDate = useMemo(() => {
    try {
      // Check if createdAt is a valid date
      const dateValue = message.createdAt;
      if (!dateValue) return 'Just now';

      // Simple validation to prevent invalid dates
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Just now';

      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Just now';
    }
  }, [message.createdAt]);

  // Sanitize message content
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(message.content);
  }, [message.content]);

  // Check if the message contains a suggestion
  const isSuggestion = useMemo(() => {
    // For debugging
    console.log(`Message role: ${message.role}`);
    console.log(`Checking message: ${message.content.substring(0, 50)}...`);

    const result = detectSuggestion(message.content, message.role);
    console.log(`Is suggestion: ${result}`);
    return result;
  }, [message.content, message.role]);

  // Extract the AI thought process from the message (everything before the suggestion content)
  const thoughtProcess = useMemo(() => {
    if (isSuggestion && message.role === 'assistant') {
      // Debug the metadata to see what's coming from the backend
      console.log('Message metadata:', message.metadata);

      // Check if the message has a thoughtProcess field directly
      if (message.metadata?.thoughtProcess) {
        console.log('Found thoughtProcess in metadata:', message.metadata.thoughtProcess);
        return DOMPurify.sanitize(message.metadata.thoughtProcess);
      }

      // For backward compatibility - extract from content if no thoughtProcess field
      // Look for the beginning of the structured content (could be multiple patterns)
      let startIndex = -1;

      // Common markers that indicate the start of structured content rather than thought process
      const structureMarkers = [
        '[Accept Suggestion]',
        'Would you like to use this',
        'Board Structure:',
        "Here's a board layout",
        'To Do**',
        '**To Do',
        '## Board Structure',
        '## Task Breakdown',
        '## Task Improvement',
      ];

      // Find the earliest occurrence of any marker
      structureMarkers.forEach((marker) => {
        const idx = message.content.indexOf(marker);
        if (idx !== -1 && (startIndex === -1 || idx < startIndex)) {
          startIndex = idx;
        }
      });

      if (startIndex > 0) {
        // Extract only the AI's reasoning/thought process before the suggestion
        let processText = message.content.substring(0, startIndex).trim();

        // For cleaner display, remove any trailing incomplete sentences
        const lastSentenceBreak = Math.max(
          processText.lastIndexOf('. '),
          processText.lastIndexOf('! '),
          processText.lastIndexOf('? ')
        );

        if (lastSentenceBreak > 0) {
          processText = processText.substring(0, lastSentenceBreak + 1);
        }

        return DOMPurify.sanitize(processText);
      }
    }

    // If it's not a suggestion or we couldn't find the start point, return the original content
    return sanitizedContent;
  }, [isSuggestion, message, sanitizedContent]);

  // Handle displaying only partial content in the chat to make it cleaner
  const displayContent = useMemo(() => {
    // For user messages, always show the original content
    if (message.role === 'user') {
      return sanitizedContent;
    }

    // For AI messages that are suggestions, show the thought process
    if (isSuggestion && message.role === 'assistant') {
      return thoughtProcess || sanitizedContent;
    }

    // For all other messages, show the original content
    return sanitizedContent;
  }, [isSuggestion, sanitizedContent, thoughtProcess, message.role]);

  // Extract suggestion ID from message content
  const suggestionId = useMemo(() => {
    if (isSuggestion) {
      return extractSuggestionId(message.content);
    }
    return null;
  }, [isSuggestion, message.content]);

  // Determine the suggestion type
  const suggestionType = useMemo(() => {
    if (isSuggestion) {
      return determineSuggestionType(message.content);
    }
    return '';
  }, [isSuggestion, message.content]);

  // Extract a short description of the suggestion
  const suggestionDescription = useMemo(() => {
    if (isSuggestion) {
      const type = determineSuggestionType(message.content);
      switch (type) {
        case 'board':
          return 'Board structure suggestion';
        case 'task-breakdown':
          return 'Task breakdown suggestion';
        case 'task-improvement':
          return 'Task improvement suggestion';
        default:
          return 'AI suggestion';
      }
    }
    return '';
  }, [isSuggestion, message.content]);

  // Handle accept suggestion
  const handleAccept = async (id: string) => {
    try {
      // Call your API to accept the suggestion using the chatService
      if (onAcceptSuggestion) {
        onAcceptSuggestion(id);
      } else {
        await chatService.acceptSuggestion(id);
      }
      setSuggestionAccepted(true);
      setSuggestionModalOpen(false);
    } catch (error) {
      console.error('Failed to accept suggestion:', error);
    }
  };

  // Handle reject suggestion
  const handleReject = async (id: string) => {
    try {
      // Call your API to reject the suggestion using the chatService
      if (onRejectSuggestion) {
        onRejectSuggestion(id);
      } else {
        await chatService.rejectSuggestion(id);
      }
      setSuggestionRejected(true);
      setSuggestionModalOpen(false);
    } catch (error) {
      console.error('Failed to reject suggestion:', error);
    }
  };

  const handleOpenSuggestionModal = () => {
    setSuggestionModalOpen(true);
  };

  const handleCloseSuggestionModal = () => {
    setSuggestionModalOpen(false);
  };

  return (
    <Box my="xs" style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
      <Card
        padding="md"
        radius="md"
        withBorder
        style={{
          backgroundColor: isUser ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-dark-6)',
        }}
      >
        <Group gap="xs" mb="xs">
          <Avatar size="sm" color={isUser ? 'blue' : 'gray'} radius="xl">
            {isUser ? <UserIcon w={18} h={18} /> : <RobotIcon w={18} h={18} />}
          </Avatar>
          <Text size="sm" fw={500} c={isUser ? 'white' : undefined}>
            {isUser ? 'You' : 'Assistant'}
          </Text>
          <Text size="xs" c={isUser ? 'white' : 'dimmed'}>
            {formattedDate}
          </Text>
        </Group>

        <div
          dangerouslySetInnerHTML={{ __html: displayContent }}
          className="rich-text-content"
          style={{
            color: isUser ? 'white' : undefined,
            wordBreak: 'break-word',
          }}
        />

        {isSuggestion && suggestionId && !suggestionAccepted && !suggestionRejected && (
          <Box mt="md">
            <Group>
              <Badge color="blue" size="sm">
                {suggestionDescription}
              </Badge>
              <Button
                variant="light"
                color="blue"
                size="xs"
                onClick={handleOpenSuggestionModal}
                leftSection={<span>👁️</span>}
              >
                View Details
              </Button>
            </Group>
          </Box>
        )}
      </Card>

      {/* Suggestion Modal */}
      {isSuggestion && suggestionId && (
        <SuggestionModal
          opened={suggestionModalOpen}
          onClose={handleCloseSuggestionModal}
          type={suggestionType as SuggestionType}
          content={parseSuggestionContent(message.content, suggestionType as SuggestionType)}
          suggestionId={suggestionId}
          isLoading={false}
          isProcessing={suggestionAccepted || suggestionRejected}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </Box>
  );
}
