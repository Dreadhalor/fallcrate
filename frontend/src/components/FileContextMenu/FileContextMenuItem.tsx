type Props = {
  icon: React.ReactNode;
  title: string;
};

const FileContextMenuItem = ({ icon, title }: Props) => {
  return (
    <span className='flex items-center gap-[12px]'>
      {icon}
      {title}
    </span>
  );
};

export default FileContextMenuItem;
