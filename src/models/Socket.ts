import { ChatMessage } from './ChatMessage';
import {
  BoardSuggestion,
  SuggestionStatus,
  SuggestionType,
  TaskBreakdownSuggestion,
  TaskImprovementSuggestion,
} from './Suggestion';

export const SOCKET_EVENTS = {
  SUGGESTION_PREVIEW: 'suggestion_preview',
  SUGGESTION_STATUS_UPDATE: 'suggestion_status_update',
  USER_TYPING: 'user_typing',
  AI_TYPING: 'ai_typing',
  NEW_MESSAGE: 'new_message',
  MESSAGE_READ_STATUS: 'message_read_status',
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export interface SuggestionPreviewEvent {
  sessionId: string;
  suggestionId: string;
  type: SuggestionType;
  preview: BoardSuggestion | TaskBreakdownSuggestion | TaskImprovementSuggestion;
}

export interface SuggestionStatusUpdateEvent {
  sessionId: string;
  suggestionId: string;
  status: SuggestionStatus;
}

export interface TypingStatusEvent {
  sessionId: string;
  userId: string;
  isTyping: boolean;
}

export interface AITypingStatusEvent {
  sessionId: string;
  isTyping: boolean;
}

export interface MessageReadStatusEvent {
  messageId: string;
}

export interface NewMessageEvent {
  message: ChatMessage;
}

export type EventsMap = {
  [SOCKET_EVENTS.SUGGESTION_PREVIEW]: SuggestionPreviewEvent;
  [SOCKET_EVENTS.SUGGESTION_STATUS_UPDATE]: SuggestionStatusUpdateEvent;
  [SOCKET_EVENTS.USER_TYPING]: TypingStatusEvent;
  [SOCKET_EVENTS.AI_TYPING]: AITypingStatusEvent;
  [SOCKET_EVENTS.NEW_MESSAGE]: NewMessageEvent;
  [SOCKET_EVENTS.MESSAGE_READ_STATUS]: MessageReadStatusEvent;
};
