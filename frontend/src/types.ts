export interface CustomFile {
  id: string;
  name: string;
  type: string;
  size?: number;
  parent: string | null;
  url?: string;
}

export interface DraggedItem {
  id: string;
}
