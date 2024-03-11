import { useRef, useEffect } from 'react';

type Props = {
  text: string;
  truncationChange?: (isTruncated: boolean) => void;
};

const TruncatedText = ({ text, truncationChange }: Props) => {
  const text_ref = useRef<HTMLDivElement>(null);

  const checkTruncation = () => {
    if (text_ref.current && truncationChange) {
      truncationChange(
        text_ref.current.offsetWidth < text_ref.current.scrollWidth,
      );
    }
  };

  useEffect(() => {
    checkTruncation();
  }, [text]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => checkTruncation());

    if (text_ref.current) resizeObserver.observe(text_ref.current);

    return () => {
      if (text_ref.current) resizeObserver.unobserve(text_ref.current);
    };
  }, []);

  return (
    <div className='truncate' ref={text_ref}>
      {text}
    </div>
  );
};

export { TruncatedText };
