import { Modal } from 'antd';
import { PDFViewer } from './PDFViewer';
import { useImageModal } from '@providers/ImageModalProvider';

const PDFViewerModal = () => {
  const { open, setOpen, pdf } = useImageModal();
  return (
    <Modal
      open={open && pdf}
      onCancel={() => setOpen(false)}
      bodyStyle={{ marginInline: -1, padding: 0 }} // remove padding
      footer={null} // no footer
      closable={false} // no close button
      destroyOnClose // destroy popovers when modal closes
    >
      <PDFViewer />
    </Modal>
  );
};

export default PDFViewerModal;
