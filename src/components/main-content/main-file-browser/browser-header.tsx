import { FaCheck, FaMinus } from 'react-icons/fa';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';

const BrowserHeader = () => {
  const { selectedFiles, currentDirectoryFiles, massToggleSelectFiles } =
    useFilesystem();
  const all_files_selected =
    selectedFiles.length === currentDirectoryFiles.length;
  const some_files_selected = selectedFiles.length > 0 && !all_files_selected;

  const getFileSelectionClass = () => {
    if (some_files_selected || all_files_selected) return 'bg-black text-white';
    return 'bg-white text-black hover:bg-gray-200';
  };

  return (
    <div className='group sticky top-0 z-10 flex w-full flex-row items-center bg-white font-semibold'>
      <div className='p-[10px]'>
        <button
          className={`flex h-[25px] w-[25px] items-center justify-center rounded-sm border-gray-500 group-hover:border ${
            some_files_selected && 'border'
          } ${getFileSelectionClass()}`}
          onClick={massToggleSelectFiles}
        >
          {all_files_selected && <FaCheck />}
          {some_files_selected && <FaMinus />}
        </button>
      </div>
      <div className='flex h-full flex-1 flex-row items-center gap-[10px] border-b border-[rgba(167,146,114,0.2)] border-l-[rgb(0,97,254)] px-[10px] py-[4px] align-baseline'>
        <span className='flex-1'>Name</span>
        <div className='flex w-[100px] items-center justify-center'>Size</div>
      </div>
    </div>
  );
};

export { BrowserHeader };
