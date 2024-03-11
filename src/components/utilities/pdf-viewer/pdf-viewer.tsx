import { useEffect, useState } from 'react';
import { useFileViewer } from '@fallcrate/providers/file-viewer-provider';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { PDFViewerToolbar } from './pdf-viewer-toolbar';
import { PDFViewerContent } from './pdf-viewer-content';

export const PDFViewer = () => {
  const { file } = useFileViewer();
  const { getFileUrl } = useFilesystem();
  const [url, setUrl] = useState('');

  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfFillWidth, setPdfFillWidth] = useState(0);
  const [pdfContainHeight, setPdfContainHeight] = useState(0);
  const [containOrFill, setContainOrFill] = useState<'contain' | 'fill'>(
    'contain',
  );

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setScale(1);
  };

  useEffect(() => {
    setScale(1);
    setNumPages(0);
    setPageNumber(1);
  }, [file, open]);

  const padding = 10;

  const changePage = (offset: number) =>
    setPageNumber((prevPageNumber) => prevPageNumber + offset);

  const previousPage = () => changePage(-1);
  const firstPage = () => setPageNumber(1);

  const nextPage = () => changePage(1);
  const lastPage = () => setPageNumber(numPages);

  const handleResize = () => {
    const container = document.getElementById('pdf-container');
    const containerHeight = container?.offsetHeight ?? 0;
    const containerWidth = container?.offsetWidth ?? 0;
    const toolbar = document.getElementById('pdf-toolbar');
    const toolbarHeight = toolbar?.offsetHeight ?? 0;
    setPdfContainHeight(containerHeight - toolbarHeight - padding * 2);
    setPdfFillWidth(containerWidth - padding * 2);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (file?.mimeType === 'application/pdf') {
      getFileUrl(file?.id ?? '').then(async (url) => {
        setUrl(url);
      });
    } else {
      setUrl('');
    }
  }, [file]);

  return (
    <div className='flex h-full w-full flex-col' id='pdf-container'>
      <PDFViewerToolbar
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
        numPages={numPages}
        previousPage={previousPage}
        nextPage={nextPage}
        firstPage={firstPage}
        lastPage={lastPage}
        containOrFill={containOrFill}
        setContainOrFill={setContainOrFill}
      />
      <PDFViewerContent
        {...{
          padding,
          url,
          onDocumentLoadSuccess,
          pageNumber,
          containOrFill,
          setContainOrFill,
          pdfFillWidth,
          pdfContainHeight,
          scale,
        }}
      />
    </div>
  );
};
