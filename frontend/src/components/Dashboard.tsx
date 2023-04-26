import AllFilesMenu from './AllFilesMenu';
import MainContent from './MainContent/MainContent';

const Dashboard = () => {
  return (
    <div id='dashboard' className='flex flex-1 flex-row overflow-hidden'>
      <div // Sidebar, but there's only one item in it so not worth making a separate component
        id='sidebar'
        className='z-20 h-full w-[250px] border-r border-gray-300 bg-faded_bg'
      >
        <AllFilesMenu />
      </div>
      <MainContent />
    </div>
  );
};

export default Dashboard;
