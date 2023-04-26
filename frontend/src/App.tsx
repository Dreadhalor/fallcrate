import Navbar from '@components/Navbar';
import Dashboard from '@components/Dashboard';

function App() {
  return (
    <div className='flex h-full w-full flex-col bg-white'>
      <Navbar />
      <Dashboard />
    </div>
  );
}

export default App;
