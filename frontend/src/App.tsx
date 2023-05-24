import Navbar from '@components/Navbar';
import Dashboard from '@components/Dashboard/Dashboard';
import { UploadQueuePane } from '@components/UploadQueue/UploadQueuePane';

function App() {
  return (
    <>
      <div className='flex h-full w-full flex-col bg-white'>
        <Navbar />
        <Dashboard />
      </div>
      <UploadQueuePane />
    </>
  );
}

export default App;
