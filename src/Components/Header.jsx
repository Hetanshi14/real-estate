import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Listings', path: '/listings' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-stone-700 shadow-md' : 'bg-transparent'
        }`}>
      <div className="max-w-screen mx-auto px-6 py-4 flex justify-between items-center text-white">
        <Link to="/" className="flex items-center gap-2">
          <img src="/public/logo.png" alt="Zivaas Properties" className="h-10 w-auto" />
          <span className="text-xl font-semibold hidden sm:inline">Zivaas Properties</span>
        </Link>
        <nav className="hidden md:flex gap-6 text-md">
          {navLinks.map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                isActive
                  ? 'text-rose-100 font-semibold'
                  : 'text-white relative inline-block after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-0 after:bg-rose-200 after:transition-all after:duration-300 hover:after:w-full'
              }>
              {link.name}
            </NavLink>
          ))}
        </nav>
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 space-y-2 bg-stone-700">
          {navLinks.map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? 'block text-orange-400 font-semibold'
                  : 'block text-white hover:text-orange-400'
              }>
              {link.name}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
