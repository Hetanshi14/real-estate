import React, { Component } from 'react';
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
import Developer from './Pages/Developer';
import PropertyDetails from './Pages/PropertyDetails';
import PrivateRoute from './Admin/PrivateRoute';
import AuthProvider from './context/AuthContext';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
            Something went wrong. Please try again or contact support.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    console.log(`Navigated to route: ${pathname}`); // Debug log
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="col-span-full min-h-screen flex justify-center items-center h-72 w-auto" aria-busy="true">
        <div className="flex flex-col items-center">
          <img
            src="https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/logo/zivaaslogo01.jpg"
            alt="Zivaas Logo"
            className="h-32 w-auto object-contain animate-pulse"
          />
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
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
        <Route path="/signup" element={<ErrorBoundary><Signup /></ErrorBoundary>} />
        <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="admin">
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
      <Footer />
    </AuthProvider>
  );
};

export default App;