import { Timestamp } from 'firebase/firestore';

export interface CustomFileFields {
  id: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  parent: string | null;
  createdAt: Timestamp;
}
export interface CustomFile extends CustomFileFields {
  uploadedBy: string;
}
export interface FileUploadData extends CustomFileFields {
  file?: File;
}

export interface DraggedItem {
  id: string;
}
