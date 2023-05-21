import { useFilesystem } from '@hooks/useFilesystem';
import prettyBytes from 'pretty-bytes';
import { default as parse } from 'parse-unit';

// const input = '15 gb';
// const result = parse(input);
// const [value, unit] = result;
// const bytes = value * 1000 ** ['b', 'kb', 'mb', 'gb', 'tb'].indexOf(unit);
// console.log(bytes);

export const StorageUsedBar = () => {
  const { files } = useFilesystem();
  const storageUsed = files.reduce((acc, file) => {
    return acc + (file.size ?? 0);
  }, 0);
  return (
    <div className='flex flex-col gap-[10px] p-[15px]'>
      <div className='flex flex-row items-center justify-between'>
        <div className='text-sm font-bold'>Storage Used</div>
        <div className='text-sm font-bold'>
          {prettyBytes(storageUsed)} / 1 GB
        </div>
      </div>
      <div className='relative h-2 w-full rounded-full bg-gray-200'>
        <div
          className='absolute top-0 left-0 h-full rounded-full bg-blue-500'
          style={{
            width: `${(storageUsed / 1e9) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
};
