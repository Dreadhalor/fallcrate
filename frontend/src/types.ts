import { Timestamp } from 'firebase/firestore';

export interface CustomFileFields {
  id: string;
  name: string;
  type: string;
  size?: number;
  parent: string | null;
  createdAt: Timestamp;
}
export interface CustomFile extends CustomFileFields {
  uploadedBy: string;
}
export interface DraggedItem {
  id: string;
}
