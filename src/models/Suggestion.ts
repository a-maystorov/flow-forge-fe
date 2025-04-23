export type SuggestionStatus = 'pending' | 'accepted' | 'rejected' | 'modified';

// Add chatIntent type for improved type safety
export type ChatIntent =
  | 'general_question'
  | 'board_suggestion'
  | 'task_breakdown'
  | 'task_improvement'
  | 'capability_question';

export interface BaseEntity {
  id: string;
  title: string;
  description: string;
}

export interface BaseTask extends BaseEntity {
  position: number;
}

export interface BaseSubtask extends BaseEntity {
  completed: boolean;
}

export interface BoardSuggestion {
  boardName: string;
  columns: {
    name: string;
    position: number;
    tasks: BaseTask[];
  }[];
  thoughtProcess?: string; // New field explaining the AI's reasoning
}

export interface TaskBreakdownSuggestion {
  taskTitle: string;
  taskDescription: string;
  subtasks: BaseSubtask[];
  thoughtProcess?: string; // New field explaining the AI's reasoning
}

export interface TaskImprovementSuggestion {
  originalTask: {
    title: string;
    description: string;
  };
  improvedTask: {
    title: string;
    description: string;
  };
  reasoning: string;
  thoughtProcess?: string; // New field explaining the AI's reasoning
}

export type SuggestionType = 'board' | 'task-breakdown' | 'task-improvement';
export type SuggestionContent =
  | BoardSuggestion
  | TaskBreakdownSuggestion
  | TaskImprovementSuggestion;

// Response structure from chat-suggestions endpoints
export interface ChatSuggestionResponse {
  responseMessage: {
    _id: string;
    content: string;
    role: 'assistant';
    sessionId: string;
    createdAt: string;
    updatedAt: string;
    metadata?: {
      intent: ChatIntent;
      confidence: number;
    };
  };
  detectedIntent: ChatIntent;
  confidence: number;
  suggestions: {
    boardSuggestion?: BoardSuggestion;
    taskBreakdown?: TaskBreakdownSuggestion;
    taskImprovement?: TaskImprovementSuggestion;
  };
  suggestionId?: string;
}

export interface SuggestionMetadata {
  taskId?: string;
  boardId?: string;
  columnId?: string;
  parentTaskId?: string;
  relatedSuggestionId?: string;
}

export interface Suggestion {
  _id: string;
  userId: string;
  sessionId: string;
  type: SuggestionType;
  status: SuggestionStatus;
  content: SuggestionContent;
  originalMessage: string;
  createdAt: string;
  updatedAt: string;
  metadata?: SuggestionMetadata;
  relatedSuggestionId?: string;
  intent?: ChatIntent;
  thoughtProcess?: string;
}
