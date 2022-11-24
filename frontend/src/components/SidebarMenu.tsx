import { useState } from 'react';
import { FaChevronRight } from 'react-icons/fa';

type Props = {
  title: string;
};

const SidebarMenu = ({ title }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className='flex cursor-pointer flex-row items-center gap-[5px] border-black px-[20px] py-[10px]'
      onClick={() => setIsOpen((prev) => !prev)}
    >
      <FaChevronRight
        size={10}
        className='transition-transform'
        style={{
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
        }}
      />
      {title}
    </div>
  );
};

export default SidebarMenu;
