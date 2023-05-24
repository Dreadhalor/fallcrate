import { Spin } from 'antd';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
type Props = {
  padding: number;
  url: string;
  onDocumentLoadSuccess: (args: any) => void;
  pageNumber: number;
  pdfWidth: number;
  scale: number;
};

export const PDFViewerContent = ({
  padding,
  url,
  onDocumentLoadSuccess,
  pageNumber,
  pdfWidth,
  scale,
}: Props) => {
  return (
    <div
      className='flex-1 overflow-auto bg-[#a0a0a0]'
      style={{ padding: `${padding}px` }}
    >
      <div className='overflow-hidden rounded-lg'>
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<Spin size='large' />}
        >
          <Page pageNumber={pageNumber} width={pdfWidth * scale} />
        </Document>
      </div>
    </div>
  );
};
