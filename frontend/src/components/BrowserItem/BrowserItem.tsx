import { FaCheck, FaFile, FaFolder } from 'react-icons/fa';
import { File } from '../../helpers';
import './styles.scss';

type Props = {
  file: File;
  selectedFiles: string[];
  selectFile: (file_id: string) => void;
  openFile: (file_id: string) => void;
};

const BrowserItem = ({ file, selectedFiles, selectFile, openFile }: Props) => {
  const is_selected = selectedFiles.includes(file.id);
  const selected_class = is_selected ? 'item-selected' : 'item-unselected';
  const some_selected = selectedFiles.length > 0;
  return (
    <div className='browser-item group flex w-full flex-row items-center bg-white'>
      <div className='p-[7px]'>
        <div
          className={`flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-sm border-gray-500 group-hover:border ${
            some_selected && 'border'
          } ${
            is_selected
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-200'
          }`}
          onClick={() => selectFile(file.id)}
        >
          {is_selected && <FaCheck />}
        </div>
      </div>
      <div
        className={`flex h-full flex-1 cursor-pointer flex-row items-center gap-[10px] border-b border-[rgba(167,146,114,0.2)] border-l-[rgb(0,97,254)] py-[4px] pr-[10px] ${selected_class}`}
        onClick={() => openFile(file.id)}
      >
        {file.type === 'directory' ? <FaFolder /> : <FaFile />}
        {file.name}
      </div>
    </div>
  );
};

export default BrowserItem;
