import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Components/Header';
import Footer from './Components/Footer';
import Home from './Pages/Home';
import Listings from './Pages/Listings';
import Detail from './Pages/Detail';
import AboutUs from './Pages/AboutUs';
import Contact from './Pages/Contact';
import AddProperty from './Pages/AddProperty';
import Signup from './Pages/Signup';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

const App = () => {
  return (
    <>
      <Header />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/:id" element={<Detail />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/add-property" element={<AddProperty />} />
      </Routes>
      <Footer />
    </>
  );
};

export default App;
