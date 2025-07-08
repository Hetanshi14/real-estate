import { Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';

import Home from './Pages/Home';
import Listings from './Pages/Listings';
import Upcoming from './Pages/Upcoming';
import Detail from './Pages/Detail';
import AboutUs from './Pages/AboutUs';
import Booking from './Pages/Booking';

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/booking" element={<Booking />} />
      </Routes>

      <Footer />
    </>
  );
};

export default App;
