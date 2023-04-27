import React, { createContext, useContext, useState } from 'react';

type DragAndDropState = {
  draggedFileId: string | null;
  source: string | null; // For example: 'MainFileBrowser', 'Breadcrumb', 'SidebarBrowser'
};

const initialState: DragAndDropState = {
  draggedFileId: null,
  source: null,
};

const DragAndDropContext = createContext<{
  state: DragAndDropState;
  setState: React.Dispatch<React.SetStateAction<DragAndDropState>>;
}>({
  state: initialState,
  setState: () => {},
});

export const useDragAndDrop = () => {
  return useContext(DragAndDropContext);
};

type Props = {
  children: React.ReactNode;
};

export const DragAndDropProvider = ({ children }: Props) => {
  const [state, setState] = useState<DragAndDropState>(initialState);

  return (
    <DragAndDropContext.Provider value={{ state, setState }}>
      {children}
    </DragAndDropContext.Provider>
  );
};
