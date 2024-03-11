import React, { createContext, useState, useContext } from 'react';
import { CustomFile } from '@fallcrate/types';
import { PDFViewerModal } from '@fallcrate/components/utilities/pdf-viewer/pdf-viewer-modal';
import { VideoViewer } from '@fallcrate/components/utilities/video-viewer';

interface FileViewerContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  file: CustomFile | null;
  setFile: (file: CustomFile | null) => void;
  openFileViewer: (file: CustomFile) => void;
  closeFileViewer: () => void;
  pdfViewer: JSX.Element;
  videoViewer: JSX.Element;
}

const FileViewerContext = createContext<FileViewerContextProps | undefined>(
  undefined,
);

type Props = {
  children: React.ReactNode;
};

export const FileViewerProvider = ({ children }: Props) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<CustomFile | null>(null);

  const openFileViewer = (file: CustomFile) => {
    setFile(file);
    setOpen(true);
  };
  const closeFileViewer = () => {
    setFile(() => null);
    setOpen(false);
  };

  const pdfViewer = <PDFViewerModal />;
  const videoViewer = <VideoViewer />;

  return (
    <FileViewerContext.Provider
      value={{
        open,
        setOpen,
        file,
        setFile,
        openFileViewer,
        closeFileViewer,
        pdfViewer,
        videoViewer,
      }}
    >
      {children}
    </FileViewerContext.Provider>
  );
};

export const useFileViewer = () => {
  const context = useContext(FileViewerContext);

  if (context === undefined) {
    throw new Error('useFileViewer must be used within a FileViewerProvider');
  }

  return context;
};
