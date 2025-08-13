import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, UserCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

const LOGO_URL = 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/logo/zivaas-logo.png';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Listings', path: '/listings' },
    { name: 'Developer', path: '/developer' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Profile', path: '/profile' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Header: Session check error:', error.message);
          setIsAuthenticated(false);
          return;
        }
        setIsAuthenticated(!!session);
      } catch (err) {
        console.error('Header: Error in checkAuth:', err);
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/login', { state: { from: location.pathname } });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-stone-700 shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-screen mx-auto px-6 py-2 flex items-center justify-between text-white">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.img
            src={LOGO_URL}
            alt="Zivaas Properties"
            className="h-14 w-auto drop-shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            onError={(e) => {
              console.error('Header: Logo image load failed:', LOGO_URL);
              e.target.alt = 'Zivaas Properties';
            }}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-md" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) =>
            link.name === 'Profile' ? (
              <button
                key={link.name}
                onClick={handleProfileClick}
                className={`text-white text-sm px-2 py-1 font-semibold relative inline-block ${
                  !isAuthenticated ? 'cursor-pointer relative group' : ''
                }`}
                title={!isAuthenticated ? 'Please log in to view your profile' : 'View your profile'}
                aria-label={isAuthenticated ? 'Go to profile' : 'Log in to view profile'}
              >
                <UserCircle size={24} className="inline mr-1" />
                {!isAuthenticated && (
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-stone-600 text-white text-xs rounded py-1 px-2">
                    Log in required
                  </span>
                )}
              </button>
            ) : (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  isActive
                    ? 'text-rose-100 font-semibold'
                    : 'text-white relative inline-block after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-0 after:bg-rose-200 after:transition-all after:duration-300 hover:after:w-full'
                }
                aria-label={`Go to ${link.name} page`}
              >
                {link.name}
              </NavLink>
            )
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            className="text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 pt-4 bg-stone-700" role="navigation" aria-label="Mobile navigation">
          <nav className="space-y-4">
            {navLinks.map((link) =>
              link.name === 'Profile' ? (
                <button
                  key={link.name}
                  onClick={handleProfileClick}
                  className={`text-white rounded font-semibold hover:text-rose-200 w-full text-left ${
                    !isAuthenticated ? 'cursor-pointer relative group' : ''
                  }`}
                  title={!isAuthenticated ? 'Please log in to view your profile' : 'View your profile'}
                  aria-label={isAuthenticated ? 'Go to profile' : 'Log in to view profile'}
                >
                  <UserCircle size={18} className="inline mr-1" /> {link.name}
                  {!isAuthenticated && (
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 hidden group-hover:block bg-stone-600 text-white text-xs rounded py-1 px-2">
                      Log in required
                    </span>
                  )}
                </button>
              ) : (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? 'block text-orange-400 font-semibold'
                      : 'block text-white hover:text-orange-400'
                  }
                  aria-label={`Go to ${link.name} page`}
                >
                  {link.name}
                </NavLink>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;