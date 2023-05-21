import AllFilesMenu from '@components/AllFilesMenu';
import { FileUploadProgressBar } from '@components/UploadQueue/FileUploadProgressBar';
import { StorageUsedBar } from '@components/StorageUsedBar';
import { useFilesystem } from '@hooks/useFilesystem';

type Props = {
  style: React.CSSProperties;
};

const Sidebar = ({ style }: Props) => {
  // const { uploadQueue } = useFilesystem();

  return (
    <div
      id='sidebar'
      className='h-full w-full overflow-auto transition-[opacity]'
      style={style}
    >
      <AllFilesMenu />
      <StorageUsedBar />
      {/* {uploadQueue.map((upload) => (
        <FileUploadBar upload={upload} key={upload.uploadData.id} />
      ))} */}
    </div>
  );
};

export default Sidebar;
