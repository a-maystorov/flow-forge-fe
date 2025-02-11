import Column from '@/models/Column';

export interface Board {
  _id: string;
  name: string;
  columns: Column[];
  ownerId: string;
}

export interface BoardInput {
  name: string;
}
