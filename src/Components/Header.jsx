import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Profile', path: '/profile' },
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

  const showAuthButton = !isAuthenticated && location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/profile';

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/login'; // Redirect to login after logout
    } catch (err) {
      console.error('Logout error:', err.message);
    }
  };

  const handleNavClick = (path) => {
    if (path === '/profile' && !isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } }); // Redirect to login with intended destination
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-stone-700 shadow-md' : 'bg-transparent'}`}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between text-white">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-semibold hidden sm:inline">Zivaas Properties</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-md">
          <div className="flex justify-center gap-8 flex-grow">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => handleNavClick(link.path)}
                className={({ isActive }) =>
                  isActive
                    ? 'text-rose-100 font-semibold'
                    : 'text-white relative inline-block after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-0 after:bg-rose-200 after:transition-all after:duration-300 hover:after:w-full'
                }
                style={link.name === 'Profile' && !isAuthenticated ? { pointerEvents: 'none', opacity: 0.5 } : {}}
              >
                {link.name}
              </NavLink>
            ))}
          </div>
          {showAuthButton ? (
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </Link>
          ) : isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Log Out
            </button>
          ) : null}
        </nav>
        <div className="md:hidden flex items-center gap-4">
          {showAuthButton ? (
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </Link>
          ) : isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Log Out
            </button>
          ) : null}
          <button
            className="text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 bg-stone-700">
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => {
                  handleNavClick(link.path);
                  setMobileMenuOpen(false);
                }}
                className={({ isActive }) =>
                  isActive
                    ? 'block text-orange-400 font-semibold'
                    : 'block text-white hover:text-orange-400'
                }
                style={link.name === 'Profile' && !isAuthenticated ? { pointerEvents: 'none', opacity: 0.5 } : {}}
              >
                {link.name}
              </NavLink>
            ))}
            {showAuthButton ? (
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            ) : isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors w-full text-left"
              >
                Log Out
              </button>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;