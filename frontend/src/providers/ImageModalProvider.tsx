import React, { createContext, useState, useContext, useEffect } from 'react';
import { CustomFile } from '@src/types';
import PDFViewerModal from '@components/utilities/PDFViewer/PDFViewerModal';

interface ImageModalContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  file: CustomFile | null;
  setFile: (file: CustomFile | null) => void;
  openImageModal: (file: CustomFile) => void;
  closeImageModal: () => void;
  pdf: boolean;
  modal: JSX.Element;
}

const ImageModalContext = createContext<ImageModalContextProps | undefined>(
  undefined
);

type Props = {
  children: React.ReactNode;
};

export const ImageModalProvider = ({ children }: Props) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<CustomFile | null>(null);
  const [pdf, setPdf] = useState(false);

  useEffect(() => {
    if (file) {
      if (file.name.endsWith('.pdf')) {
        setPdf(true);
      } else {
        setPdf(false);
      }
    }
  }, [file]);

  const openImageModal = (file: CustomFile) => {
    setOpen(true);
    setFile(file);
  };
  const closeImageModal = () => {
    setOpen(false);
  };

  const modal = <PDFViewerModal />;

  return (
    <ImageModalContext.Provider
      value={{
        open,
        setOpen,
        file,
        setFile,
        openImageModal,
        closeImageModal,
        pdf,
        modal,
      }}
    >
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
