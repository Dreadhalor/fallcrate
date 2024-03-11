import { TruncatedText } from '@fallcrate/components/utilities/truncated-text';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { CustomFile } from '@fallcrate/types';
import { FaFile, FaFolder } from 'react-icons/fa';

type Props = {
  file: CustomFile;
};

const SearchbarOption = ({ file }: Props) => {
  const { getParent } = useFilesystem();
  const parentName = getParent(file)?.name ?? 'All Files';
  return (
    <div className='flex flex-row items-start gap-[10px]'>
      {file.type === 'directory' ? (
        <FaFolder className='mt-[6px] flex-shrink-0' />
      ) : (
        <FaFile className='mt-[6px] flex-shrink-0' />
      )}
      <div className='flex min-w-0 flex-col'>
        <TruncatedText text={file.name} />
        <span className='flex text-xs text-gray-400'>
          in&nbsp;
          <TruncatedText text={parentName} />
        </span>
      </div>
    </div>
  );
};

export { SearchbarOption };
