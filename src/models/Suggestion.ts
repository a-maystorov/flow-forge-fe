export type SuggestionStatus = 'pending' | 'accepted' | 'rejected' | 'modified';

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
}

export interface TaskBreakdownSuggestion {
  taskTitle: string;
  taskDescription: string;
  subtasks: BaseSubtask[];
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
}

export type SuggestionType = 'board' | 'task-breakdown' | 'task-improvement';
export type SuggestionContent =
  | BoardSuggestion
  | TaskBreakdownSuggestion
  | TaskImprovementSuggestion;

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
}
