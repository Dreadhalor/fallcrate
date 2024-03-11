import { useRef, useState } from 'react';
import { AutoComplete, Form, FormInstance, Input } from 'antd';
import { useFilesystem } from '@fallcrate/hooks/use-filesystem';
import { FaSearch } from 'react-icons/fa';
import { SearchbarOption } from './searchbar-option';
import { useAchievements } from 'dread-ui';

const Searchbar = () => {
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [notFoundComponent, setNotFoundComponent] =
    useState<JSX.Element | null>(null);
  const {
    files,
    getFile,
    getParent,
    openFile,
    openDirectory,
    selectFilesExclusively,
  } = useFilesystem();
  const { unlockAchievementById } = useAchievements();
  const formRef = useRef<FormInstance>(null);

  const onSelection = (value: string) => {
    handleSearch('');
    const file = getFile(value);
    if (!file) return;
    if (file.type === 'directory') openFile(value);
    else {
      openDirectory(getParent(file)?.id ?? null);
      selectFilesExclusively([file.id], true);
      openFile(file.id);
      unlockAchievementById('find_in_search', 'fallcrate');
    }
    formRef.current?.resetFields();
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
        <span className='p-[10px] text-gray-400'>No files found!</span>,
      );
    }
    setOptions(res);
  };

  return (
    <Form ref={formRef} style={{ width: '600px' }}>
      <Form.Item name='search' className='m-auto'>
        <AutoComplete
          onSearch={handleSearch}
          onSelect={onSelection}
          notFoundContent={notFoundComponent}
          allowClear
          options={options}
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
            allowClear={false}
            prefix={
              <FaSearch
                color={
                  formRef.current?.getFieldValue('search')
                    ? 'black'
                    : 'rgba(0,0,0,0.3)'
                }
              />
            }
          />
        </AutoComplete>
      </Form.Item>
    </Form>
  );
};

export { Searchbar };
