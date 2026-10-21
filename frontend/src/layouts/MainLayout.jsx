import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen relative z-10">
      <Navbar />
      <main className="flex-1 w-full flex flex-col justify-center items-center p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
