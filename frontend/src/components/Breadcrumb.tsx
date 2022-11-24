import React from 'react';
import { File } from '../helpers';

type Props = {
  file: File | null;
  currentDirectory: string | null;
  openDirectory: (file_id: string | null) => void;
};

const Breadcrumb = ({ file, currentDirectory, openDirectory }: Props) => {
  const is_current_directory = (file?.id ?? null) === currentDirectory;
  const color = is_current_directory ? 'text-black' : 'text-gray-500';
  const hover = is_current_directory ? '' : 'hover:underline';

  return (
    <div>
      <button
        disabled={is_current_directory}
        className={`${hover} ${color}`}
        onClick={() => openDirectory(file?.id ?? null)}
      >
        {file?.name ?? 'Fallcrate'}
      </button>
      {!is_current_directory && <span className={color}>&nbsp;/&nbsp;</span>}
    </div>
  );
};

export default Breadcrumb;
