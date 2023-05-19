import { FilesystemContext } from "@src/contexts/FileSystemContext";
import { useContext } from "react";

export const useFilesystem = () => {
  return useContext(FilesystemContext);
};