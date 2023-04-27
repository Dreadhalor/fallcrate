import CombinationMark from '@assets/combination-mark.svg';
import { useFilesystem } from '@providers/FilesystemProvider';

const Navbar = () => {
  const { openDirectory } = useFilesystem();

  return (
    <div
      id='navbar'
      className='flex min-h-[49px] w-full border-b border-faded_border px-[8px]'
    >
      <div
        className='flex w-fit cursor-pointer flex-row items-center gap-[6px] p-[4px]'
        onClick={() => openDirectory(null)}
      >
        <img className='h-[32px]' src={CombinationMark} />
      </div>
    </div>
  );
};

export default Navbar;
