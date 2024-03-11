import { Modal } from '../modal';
import { PDFViewer } from './pdf-viewer';
import { useFileViewer } from '@fallcrate/providers/file-viewer-provider';

const PDFViewerModal = () => {
  const { open, setOpen, file } = useFileViewer();
  return (
    <Modal
      open={open && file?.mimeType === 'application/pdf'}
      setOpen={setOpen}
    >
      <PDFViewer />
    </Modal>
  );
};

export { PDFViewerModal };
