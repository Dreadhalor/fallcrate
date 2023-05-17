import CombinationMark from '@assets/combination-mark.svg';
import { useFilesystem } from '@providers/FilesystemProvider';
import { UserMenu } from 'milestone-components';
import Searchbar from './Searchbar/Searchbar';

const Navbar = () => {
  const { openDirectory } = useFilesystem();

  return (
    <div
      id='navbar'
      className='flex min-h-[49px] w-full items-center justify-between border-b border-faded_border px-[16px]'
    >
      <div
        className='flex w-fit flex-shrink-0 cursor-pointer flex-row items-center gap-[6px] py-[4px]'
        onClick={() => openDirectory(null)}
      >
        <img className='h-[32px]' src={CombinationMark} />
      </div>
      <Searchbar />
      <UserMenu light={true} height={40} />
    </div>
  );
};

export default Navbar;
