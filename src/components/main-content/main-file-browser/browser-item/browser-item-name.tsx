import { TruncatedText } from '@fallcrate/components/utilities/truncated-text';
import { CustomFile } from '@fallcrate/types';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { useEffect, useRef } from 'react';

type Props = {
  file: CustomFile;
};

const BrowserItemName = ({ file }: Props) => {
  const { renamingFileId, requestRename } = useFilesystem();

  const handleRenameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const new_name = (e.currentTarget.elements[0] as HTMLInputElement).value;
    requestRename(new_name);
  };

  const handleRenameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    const new_name = e.target.value;
    requestRename(new_name);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const isEditing = renamingFileId === file.id;

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <>
      {isEditing ? (
        <form
          className='flex-1'
          onSubmit={handleRenameSubmit}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            defaultValue={file.name}
            onBlur={handleRenameBlur}
            className='w-full'
          />
        </form>
      ) : (
        <TruncatedText text={file.name} />
      )}
    </>
  );
};

export { BrowserItemName };
