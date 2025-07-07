import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Listings', path: '/listings' },
    { name: 'Upcoming', path: '/upcoming' },
    { name: 'Details', path: '/detail/1' },
    { name: 'Agents', path: '/agents' },
    { name: 'Book Visit', path: '/booking' }
  ];

  return (
    <header className="bg-stone-700 text-white shadow-md sticky left-0 top-0 w-full z-50">
      <div className="max-w-screen mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-semibold text-white">
          Zivaas Properties
        </Link>
        <nav className="hidden md:flex gap-6 text-md">
          {navLinks.map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                isActive
                  ? 'text-white font-semibold'
                  : 'text-white hover:bg-stone-900'
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 space-y-2">
          {navLinks.map(link => (
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
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
