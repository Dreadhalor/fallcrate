import { getNestedFilesOnly } from "@src/helpers";
import { CustomFile } from "@src/types";
import { useAchievements } from "milestone-components";
import { useEffect, useLayoutEffect, useState } from "react";
import { useFiles } from "./useFiles";

export const useSelectFiles = (currentDirectory: string | null, currentDirectoryFiles: CustomFile[]) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [nestedSelectedFiles, setNestedSelectedFiles] = useState<string[]>([]);

  const { unlockAchievementById } = useAchievements();
  // aaaaaaaaahhhhhhhhhhhhhhh
  const { files } = useFiles();

  useEffect(() => {
    // reset selectedFiles if the currentDirectory changes
    // but not if we're in the middle of hopping to the directory of a file we're selecting
    setSelectedFiles((prev) => prev.filter((file_id) => currentDirectoryFiles.find((file) => file.id === file_id)));
  }, [currentDirectory]);

  useEffect(() => {
    // reset selectedFiles if the files change & any selectedFiles are deleted or moved out of the currentDirectory
    setSelectedFiles((prev) => prev.filter((file_id) => files.find((file) => file.id === file_id && file.parent === currentDirectory)));
  }, [files]);


  useLayoutEffect(() => {
    setNestedSelectedFiles(getNestedSelectedFiles());
  }, [selectedFiles]);

  const selectFile = (file_id: string) => {
    // if the currentDirectoryFiles does not include the file_id, bail
    if (!currentDirectoryFiles.find((file) => file.id === file_id)) return;
    setSelectedFiles((prev) => {
      if (prev.includes(file_id))
        return prev.filter((candidate_id) => candidate_id !== file_id);
      else {
        unlockAchievementById('select_file');
        return [...prev, file_id];
      }
    });
  };

  // doesn't trigger the achievement for selecting a file - this is intentional
  const selectFileExclusively = (file_id: string, overrideDirectoryRestriction = false) => {
    // if the currentDirectoryFiles does not include the file_id, bail
    if (!overrideDirectoryRestriction && !currentDirectoryFiles.find((file) => file.id === file_id)) return;
    setSelectedFiles([file_id]);
  };
  const getNestedSelectedFiles = () => {
    const nestedFiles = new Set<string>();
    selectedFiles.map((file_id) =>
      getNestedFilesOnly(file_id, files).forEach((file) => nestedFiles.add(file.id))
    );
    return Array.from(nestedFiles);
  };

  const massToggleSelectFiles = () => {
    if (selectedFiles.length > 0) setSelectedFiles([]);
    else {
      setSelectedFiles(currentDirectoryFiles.map((file) => file.id));
      unlockAchievementById('mass_select');
    }
  };
  return {
    selectedFiles,
    nestedSelectedFiles,
    selectFile,
    selectFileExclusively,
    getNestedSelectedFiles,
    massToggleSelectFiles,
  };
};