// import { Modal } from 'antd';
import { Modal } from '../Modal';
import { PDFViewer } from './PDFViewer';
import { useImageModal } from '@providers/ImageModalProvider';

const PDFViewerModal = () => {
  const { open, setOpen, file } = useImageModal();
  return (
    <Modal
      open={open && file?.mimeType === 'application/pdf'}
      setOpen={setOpen}
    >
      <PDFViewer />
    </Modal>
  );
};

export default PDFViewerModal;
