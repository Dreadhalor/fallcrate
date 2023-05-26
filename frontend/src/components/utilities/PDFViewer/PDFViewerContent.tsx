import { useFilesystem } from '@hooks/useFilesystem';
import { Spin } from 'antd';
import { useRef } from 'react';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';

type Props = {
  padding: number;
  url: string;
  onDocumentLoadSuccess: (args: any) => void;
  pageNumber: number;
  containOrFill: 'contain' | 'fill';
  pdfFillWidth: number;
  pdfContainHeight: number;
  scale: number;
};

export const PDFViewerContent = ({
  padding,
  url,
  onDocumentLoadSuccess,
  pageNumber,
  containOrFill,
  pdfFillWidth,
  pdfContainHeight,
  scale,
}: Props) => {
  const { closeImageModal } = useFilesystem();
  const dimensionStyle =
    containOrFill === 'contain'
      ? { height: pdfContainHeight * scale }
      : { width: pdfFillWidth * scale };
  const backgroundRef = useRef<HTMLDivElement>(null);
  const handleBackgroundClick = (e: any) => {
    if (e.target === backgroundRef.current) {
      closeImageModal();
    }
  };

  return (
    <div
      className='flex flex-1 overflow-auto'
      style={{ padding: `${padding}px` }}
      onClick={handleBackgroundClick}
      ref={backgroundRef}
    >
      <div className='m-auto overflow-hidden rounded-lg'>
        {url && (
          <Document
            file={url}
            error=''
            onLoadSuccess={onDocumentLoadSuccess}
            className='transition-[width]'
            loading={<Spin size='large' />}
          >
            <Page pageNumber={pageNumber} {...dimensionStyle} />
          </Document>
        )}
      </div>
    </div>
  );
};
