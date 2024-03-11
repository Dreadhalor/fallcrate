type Props = {
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose?: () => void;
};

export const Modal = ({ children, open, onClose }: Props) => {
  const backdropClasses = open
    ? 'opacity-100 pointer-events-auto'
    : 'opacity-0 pointer-events-none';
  const contentClasses = open ? 'opacity-100' : 'opacity-0 scale-0';

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-20 bg-[rgb(0,0,0,0.7)] duration-300 ${backdropClasses}`}
      style={{ transitionProperty: 'opacity' }}
    >
      <div
        className={`absolute inset-0 duration-300 ${contentClasses}`}
        style={{ transitionProperty: 'opacity, transform' }}
        onClick={handleBackdropClick}
      >
        {children}
      </div>
    </div>
  );
};
