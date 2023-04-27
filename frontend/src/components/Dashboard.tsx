import { Resizable } from 're-resizable';
import AllFilesMenu from './AllFilesMenu';
import MainContent from './MainContent/MainContent';

const Dashboard = () => {
  return (
    <div id='dashboard' className='flex flex-1 flex-row overflow-hidden'>
      <Resizable
        className='z-20 h-full border-r border-gray-300 bg-faded_bg'
        defaultSize={{
          width: 250,
          height: '100%',
        }}
        minWidth={100}
        maxWidth={500}
        enable={{
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
      >
        <div id='sidebar' className='h-full w-full'>
          <AllFilesMenu />
        </div>
      </Resizable>
      <MainContent />
    </div>
  );
};

export default Dashboard;
