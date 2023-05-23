import AllFilesMenu from '@components/AllFilesMenu';
import { StorageUsedBar } from '@components/StorageUsedBar';

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

export default Sidebar;
