import { Dropdown, MenuProps } from 'antd';
import {
  MdOutlineDriveFolderUpload,
  MdOutlineUploadFile,
} from 'react-icons/md';
import { MainContentMenuButton } from './main-content-toolbar';
import { FaChevronDown } from 'react-icons/fa';
import { HiUpload } from 'react-icons/hi';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';

const UploadButton = () => {
  const { promptUploadFiles, promptUploadFolder } = useFilesystem();
  const items: MenuProps['items'] = [
    {
      label: (
        <div className='flex items-center gap-[10px]'>
          <MdOutlineUploadFile size={20} />
          Files
        </div>
      ),
      key: 'upload_files',
    },
    {
      label: (
        <div className='flex items-center gap-[10px]'>
          <MdOutlineDriveFolderUpload size={20} />
          Folder
        </div>
      ),
      key: 'upload_folder',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'upload_files') promptUploadFiles();
    if (e.key === 'upload_folder') promptUploadFolder();
  };

  return (
    <Dropdown
      menu={{ items, onClick: handleMenuClick }}
      trigger={['click']}
      overlayStyle={{ minWidth: 160 }}
    >
      <div className='flex'>
        <MainContentMenuButton
          title={
            <>
              Upload
              <FaChevronDown size={12} />
            </>
          }
          icon={<HiUpload size={18} />}
          type='primary'
        />
      </div>
    </Dropdown>
  );
};

export { UploadButton };
