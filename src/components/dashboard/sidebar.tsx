import { AllFilesMenu } from '@fallcrate/components/all-files-menu';
import { StorageUsedBar } from '@fallcrate/components/storage-used-bar';

type Props = {
  style: React.CSSProperties;
};

const Sidebar = ({ style }: Props) => {
  return (
    <div
      id='sidebar'
      className='h-full w-full overflow-auto transition-[opacity]'
      style={style}
    >
      <AllFilesMenu />
      <StorageUsedBar />
    </div>
  );
};

export { Sidebar };
