import TruncatedText from '@components/utilities/TruncatedText';
import { useFilesystem } from '@providers/FilesystemProvider';
import { CustomFile } from '@src/types';

type Props = {
  file: CustomFile;
};

const SearchbarOption = ({ file }: Props) => {
  const { getParent } = useFilesystem();
  const parentName = getParent(file)?.name ?? 'All Files';
  return (
    <div className='flex flex-col'>
      <TruncatedText text={file.name} />
      <span className='flex text-xs text-gray-400'>
        in&nbsp;
        <TruncatedText text={parentName} />
      </span>
    </div>
  );
};

export default SearchbarOption;
