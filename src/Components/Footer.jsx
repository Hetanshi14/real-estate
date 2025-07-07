import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-stone-700 text-white py-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Zivaas Properties</h2>
          <p className="text-gray-400">
            Trusted name in real estate for flats, plots, commercial center and luxury living.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:bg-stone-900">Home</Link></li>
            <li><Link to="/listings" className="hover:bg-stone-900">Listings</Link></li>
            <li><Link to="/upcoming" className="hover:bg-stone-900">Upcoming Projects</Link></li>
            <li><Link to="/detail/1" className="hover:bg-stone-900">Details</Link></li>
            <li><Link to="/agents" className="hover:bg-stone-900">Agents</Link></li>
            <li><Link to="/booking" className="hover:bg-stone-900">Book Visit</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Contact Us</h3>
          <p className="text-gray-400">📍 Ahmedabad, Gujarat, India</p>
          <p className="text-gray-400">📞 +91 98765 43210</p>
          <p className="text-gray-400">📧 contact@zivaas.in</p>
        </div>
      </div>

      <div className="border-t border-stone-500 mt-8 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Zivaas Properties. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
