export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  color: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  color: string;
}