import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, UserCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

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
    { name: 'Profile', path: '/profile' }, // Kept for reference, but handled as button
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session check:', session);
      setIsAuthenticated(!!session);
    };

    window.addEventListener('scroll', handleScroll);
    checkAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session);
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
      navigate('/login', { state: { from: '/profile' } });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-stone-700 shadow-md' : 'bg-transparent'}`}
    >
      <div className="max-w-screen mx-auto px-6 py-4 flex items-center justify-between text-white">
        {/* Left-aligned Zivaas Properties with Home icon */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-semibold">Zivaas Properties</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6 text-md">
          <div className="flex justify-center gap-8 flex-grow">
            {navLinks.map((link) =>
              link.name === 'Profile' ? (
                <button
                  key={link.name}
                  onClick={handleProfileClick}
                  className={`text-white text-sm px-2 py-1 font-semibold relative inline-block ${
                    !isAuthenticated ? 'cursor-pointer relative group' : ''
                  }`}
                  title={!isAuthenticated ? 'Please log in to view your profile' : ''}
                >
                  <UserCircle size={18} className="inline mr-1" />
                  <span className="relative inline-block after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-0 after:bg-rose-200 after:transition-all after:duration-300 hover:after:w-full">
                    {link.name}
                  </span>
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
                >
                  {link.name}
                </NavLink>
              )
            )}
          </div>
        </nav>

        {/* Mobile menu toggle button on the left */}
        <div className="md:hidden flex items-center gap-2">
          <button
            className="text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 bg-stone-700">
          <nav className="space-y-4">
            {/* Navigation links */}
            {navLinks.map((link) =>
              link.name === 'Profile' ? (
                <button
                  key={link.name}
                  onClick={() => {
                    handleProfileClick();
                    setMobileMenuOpen(false);
                  }}
                  className={`text-white px-4 py-2 rounded font-semibold hover:text-rose-200 w-full text-left ${
                    !isAuthenticated ? 'cursor-pointer relative group' : ''
                  }`}
                  title={!isAuthenticated ? 'Please log in to view your profile' : ''}
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