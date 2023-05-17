import { useState } from 'react';
import { AutoComplete, Input } from 'antd';
import { useFilesystem } from '@providers/FilesystemProvider';
import { FaSearch } from 'react-icons/fa';
import SearchbarOption from './SearchbarOption';

const Searchbar = () => {
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );
  const [value, setValue] = useState<string>('');
  const [notFoundComponent, setNotFoundComponent] =
    useState<JSX.Element | null>(null);
  const {
    files,
    getFile,
    getParent,
    openFile,
    openDirectory,
    selectFileExclusively,
  } = useFilesystem();

  const onSelection = (value: string) => {
    handleSearch('');
    const file = getFile(value);
    if (!file) return;
    if (file.type === 'directory') openFile(value);
    else {
      openDirectory(getParent(file)?.id ?? null);
      selectFileExclusively(file.id);
      openFile(file.id);
    }
    setValue('');
  };

  const handleSearch = (value: string) => {
    let res: { value: string; label: any }[] = [];
    if (value.length < 1) {
      res = [];
      setNotFoundComponent(null);
    } else {
      res = files
        .filter((file) => file.name.toLowerCase().includes(value.toLowerCase()))
        .map((file) => ({
          value: file.id,
          label: <SearchbarOption file={file} />,
        }));
      setNotFoundComponent(
        <span className='p-[10px] text-gray-400'>No files found!</span>
      );
    }
    setOptions(res);
  };

  return (
    <AutoComplete
      style={{ width: 400 }}
      onSearch={handleSearch}
      onSelect={onSelection}
      notFoundContent={notFoundComponent}
      // placeholder={
      //   <span className='flex items-center gap-[5px] pl-[4px]'>
      //     <FaSearch />
      //     Search
      //   </span>
      // }
      options={options}
      allowClear
      dropdownRender={(menu) => (
        <div className='flex flex-col'>
          {options.length > 0 && (
            <div className='p-[5px]'>Results ({options.length}):</div>
          )}
          {menu}
        </div>
      )}
    >
      <Input
        placeholder='Search'
        value={value}
        prefix={<FaSearch color='rgb(200,200,200)' />}
      />
    </AutoComplete>
    // <Select
    //   suffixIcon={<FaSearch />}
    //   value={value}
    //   placeholder={
    //     <span className='flex items-center gap-[5px] pl-[3px]'>
    //       <FaSearch />
    //       Search
    //     </span>
    //   }
    //   style={{ width: 400 }}
    //   // defaultActiveFirstOption={false}
    //   autoClearSearchValue={false}
    //   showArrow={false}
    //   filterOption={false}
    //   onSearch={handleSearch}
    //   onSelect={onSelection}
    //   mode='multiple'
    //   // onChange={handleChange}
    //   notFoundContent={notFoundComponent}
    //   options={options}
    //   allowClear
    //   dropdownRender={(menu) => (
    //     <div className='flex flex-col'>
    //       <div className='p-[5px]'>Results ({options.length}):</div>
    //       {menu}
    //     </div>
    //   )}
    // />
  );
};

export default Searchbar;

// import { Select } from 'antd';
// import type { SelectProps } from 'antd';
import { ref } from 'firebase/storage';

// let timeout: ReturnType<typeof setTimeout> | null;
// let currentValue: string;

// const fetch = (value: string, callback: Function) => {
//   if (timeout) {
//     clearTimeout(timeout);
//     timeout = null;
//   }
//   currentValue = value;

//   if (value) {
//     timeout = setTimeout(fake, 300);
//   } else {
//     callback([]);
//   }
// };

// const SearchInput: React.FC<{
//   placeholder: string;
//   style: React.CSSProperties;
// }> = (props) => {
//   const [data, setData] = useState<SelectProps['options']>([]);
//   const [value, setValue] = useState<string>();

//   const handleSearch = (newValue: string) => {
//     fetch(newValue, setData);
//   };

//   const handleChange = (newValue: string) => {
//     setValue(newValue);
//   };

//   return (
//     <Select
//       showSearch
//       value={value}
//       placeholder={props.placeholder}
//       style={props.style}
//       defaultActiveFirstOption={false}
//       showArrow={false}
//       filterOption={false}
//       onSearch={handleSearch}
//       onChange={handleChange}
//       notFoundContent={null}
//       options={(data || []).map((d) => ({
//         value: d.value,
//         label: d.text,
//       }))}
//     />
//   );
// };

// const App: React.FC = () => (
//   <SearchInput placeholder='input search text' style={{ width: 200 }} />
// );

// export default App;
