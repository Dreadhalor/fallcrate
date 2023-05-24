import { useEffect, useState } from 'react';
import { useImageModal } from '@providers/ImageModalProvider';
import { useFilesystem } from '@hooks/useFilesystem';
import { PDFViewerToolbar } from './PDFViewerToolbar';
import { PDFViewerContent } from './PDFViewerContent';

export const PDFViewer = () => {
  const { pdf, file, open } = useImageModal();
  const { getFileUrl } = useFilesystem();
  const [url, setUrl] = useState('');

  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfWidth, setPdfWidth] = useState(0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setScale(1);
  };

  const padding = 10;

  const changePage = (offset: number) =>
    setPageNumber((prevPageNumber) => prevPageNumber + offset);

  const previousPage = () => changePage(-1);

  const nextPage = () => changePage(1);

  const handleResize = () =>
    setPdfWidth(
      document.getElementById('pdf-container')?.clientWidth ?? 0 - padding * 2
    );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (pdf) {
      getFileUrl(file?.id ?? '').then(async (url) => {
        setUrl(url);
      });
    }
  }, [open, pdf, file]);

  return (
    <div className='fixed inset-0 flex flex-col' id='pdf-container'>
      <PDFViewerToolbar
        pageNumber={pageNumber}
        numPages={numPages}
        previousPage={previousPage}
        nextPage={nextPage}
      />
      <PDFViewerContent
        {...{
          padding,
          url,
          onDocumentLoadSuccess,
          pageNumber,
          pdfWidth,
          scale,
        }}
      />
    </div>
  );
};
