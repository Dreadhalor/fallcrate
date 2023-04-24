import { useRef, useEffect, useState } from 'react';

type Props = {
  text: string;
  containerClassName?: string;
  truncationChange?: (isTruncated: boolean) => void;
};

const TruncatedText = ({ text, truncationChange }: Props) => {
  const textRef = useRef<HTMLDivElement>(null);

  const checkTruncation = () => {
    if (textRef.current && truncationChange) {
      truncationChange(
        textRef.current.offsetWidth < textRef.current.scrollWidth
      );
    }
  };

  useEffect(() => {
    checkTruncation();
  }, [text]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => checkTruncation());

    if (textRef.current) resizeObserver.observe(textRef.current);

    return () => {
      if (textRef.current) resizeObserver.unobserve(textRef.current);
    };
  }, []);

  return (
    <div className='h-full truncate' ref={textRef}>
      {text}
    </div>
  );
};

export default TruncatedText;
