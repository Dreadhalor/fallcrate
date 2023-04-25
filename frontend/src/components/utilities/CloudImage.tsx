// just-a-head-scratch-pia-guerra.jpg

import { useStorage, useStorageDownloadURL } from 'reactfire';
import { ref } from 'firebase/storage';

type CloudImageProps = {
  name: string;
};

function CloudImage({ name }: CloudImageProps) {
  const storage = useStorage();
  const image_ref = ref(storage, name);

  try {
    const result = useStorageDownloadURL(image_ref);
    const { status, data: image_url, error } = result;

    if (status === 'error') {
      return <span>error: {error?.message}</span>;
    }

    if (status === 'loading') {
      return <span>loading...</span>;
    }

    return <img src={image_url} alt='an image' />;
  } catch (error: any) {
    return <span>error: {error?.message || error}</span>;
  }
}

export default CloudImage;
