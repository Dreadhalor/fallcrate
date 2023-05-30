import { Timestamp } from 'firebase/firestore';
import { TaskState } from 'firebase/storage';

export interface CustomFileFields {
  id: string;
  name: string;
  type: 'file' | 'directory';
  mimeType?: string;
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

export type UploadProgress = {
  id: string;
  progress: number;
  lastFrame: number;
  state: TaskState | null;
};

export interface DraggedItems {
  ids: string[];
}
