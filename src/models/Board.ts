import Column from './Column';

export default interface Board {
  _id: string;
  name: string;
  columns: Column[];
  ownerId: string;
}
