import { Navbar } from '@fallcrate/components/navbar';
import { Dashboard } from '@fallcrate/components/dashboard/dashboard';
import { UploadQueuePane } from '@fallcrate/components/upload-queue/upload-queue-pane';

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

export { App };
