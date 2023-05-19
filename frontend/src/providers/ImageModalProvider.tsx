import React, { createContext, useState, useContext } from 'react';
import { CustomFile } from '@src/types';

interface ImageModalContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  file: CustomFile | null;
  setFile: (file: CustomFile | null) => void;
  openImageModal: (file: CustomFile) => void;
}

const ImageModalContext = createContext<ImageModalContextProps | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export const ImageModalProvider = ({ children }: Props) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<CustomFile | null>(null);

  const openImageModal = (file: CustomFile) => {
    setOpen(true);
    setFile(file);
  };

  return (
    <ImageModalContext.Provider value={{ open, setOpen, file, setFile, openImageModal }}>
      {children}
    </ImageModalContext.Provider>
  );
};

export const useImageModal = () => {
  const context = useContext(ImageModalContext);

  if (context === undefined) {
    throw new Error('useImageModal must be used within a ImageModalProvider');
  }

  return context;
};
