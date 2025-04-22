export type SuggestionStatus = 'pending' | 'accepted' | 'rejected';

export interface BoardSuggestion {
  title: string;
  description?: string;
}

export interface TaskBreakdownSuggestion {
  tasks: Array<{
    title: string;
    description?: string;
  }>;
}

export interface TaskImprovementSuggestion {
  title?: string;
  description?: string;
  improvements: string[];
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
