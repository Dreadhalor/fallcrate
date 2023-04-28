import Navbar from '@components/Navbar';
import Dashboard from '@components/Dashboard/Dashboard';
import ImageModal from '@components/utilities/ImageModal';

function App() {
  return (
    <>
      <div className='flex h-full w-full flex-col bg-white'>
        <Navbar />
        <Dashboard />
      </div>
      <ImageModal />
    </>
  );
}

export default App;
