import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './Components/Header';
import Footer from './Components/Footer';
import Home from './Pages/Home';
import Listings from './Pages/Listings';
import Detail from './Pages/Detail';
import AboutUs from './Pages/AboutUs';
import Contact from './Pages/Contact';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import Profile from './Pages/Profile';
import Developer from './Pages/Devloper';
import PropertyDetails from './Pages/PropertyDetails';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for initial app load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust delay as needed (e.g., 1000ms = 1 second)

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  if (loading) {
    return (
      <div className="col-span-full min-h-screen flex justify-center items-center h-72 w-auto" aria-busy="true">
        <div className="flex flex-col items-center">
          <img
            src="https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/logo/zivaaslogo01.jpg"
            alt="Zivaas Logo"
            className="h-32 w-auto object-contain animate-pulse"
            onError={(e) => {
              console.error("App: Failed to load logo image");
              e.target.style.display = 'none'; // Hide image on error
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/developer" element={<Developer />} />
        <Route path="/properties/developer/:developerName" element={<PropertyDetails />} />
        <Route path="/listings/:id" element={<Detail />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;