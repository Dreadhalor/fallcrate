export interface CustomFile {
  id: string;
  name: string;
  type: string;
  size?: number;
  parent: string | null;
  url?: string;
}
