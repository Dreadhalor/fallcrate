import { useState } from 'react';

export const useUploadModal = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [removeUploadModal, setRemoveUploadModal] = useState(true);

  const toggleUploadModal = (show: boolean) => {
    if (show) {
      setShowUploadModal(true);
      setRemoveUploadModal(false);
    } else {
      setShowUploadModal(false);
      setRemoveUploadModal(true);
    }
  };

  return {
    showUploadModal,
    setShowUploadModal,
    removeUploadModal,
    toggleUploadModal,
  };
};
