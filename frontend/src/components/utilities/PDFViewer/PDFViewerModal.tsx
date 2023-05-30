// import { Modal } from 'antd';
import { Modal } from '../Modal';
import { PDFViewer } from './PDFViewer';
import { useFileViewer } from '@providers/FileViewerProvider';

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

export default PDFViewerModal;
