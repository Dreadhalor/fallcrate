import { LoadingOutlined } from '@ant-design/icons';
type Props = {
  icon: React.ReactNode;
  size: number;
  suspense?: boolean;
};

export const SuspenseIcon = ({ icon, size, suspense }: Props) => {
  return (
    <span
      className='flex flex-shrink-0 items-center justify-center'
      style={{ width: `${size}px` }}
    >
      {suspense ? <LoadingOutlined size={size} /> : icon}
    </span>
  );
};
