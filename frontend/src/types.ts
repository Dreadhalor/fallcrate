import { Timestamp } from 'firebase/firestore';

export interface CustomFile {
  id: string;
  name: string;
  type: string;
  size?: number;
  parent: string | null;
  url?: string;
  createdAt: Timestamp;
  uploadedBy: string;
}
export interface DraggedItem {
  id: string;
}
