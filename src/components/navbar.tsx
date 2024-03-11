import CombinationMark from '@fallcrate/assets/combination-mark.svg';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { UserMenu } from 'dread-ui';
import { Searchbar } from './searchbar/searchbar';

const Navbar = () => {
  const { openDirectory } = useFilesystem();

  return (
    <div
      id='navbar'
      className='border-faded_border flex min-h-[49px] w-full items-center justify-between border-b px-[16px]'
    >
      <div
        className='flex w-fit flex-shrink-0 cursor-pointer flex-row items-center gap-[6px] py-[4px]'
        onClick={() => openDirectory(null)}
      >
        <img className='h-[32px]' src={CombinationMark} />
      </div>
      <Searchbar />
      <UserMenu className='ml-[8px] h-[40px] w-[40px]' />
    </div>
  );
};

export { Navbar };
