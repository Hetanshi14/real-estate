import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';

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
            <li><Link to="/" className="relative inline-block after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full">Home</Link></li>
            <li><Link to="/listings" className="relative inline-block after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full">Listings</Link></li>
            <li><Link to="/developer" className="relative inline-block after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full">Developer</Link></li>
            <li><Link to="/about" className="relative inline-block after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full">About Us</Link></li>
            <li><Link to="/contact" className="relative inline-block after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Contact Us</h3>
          <div className="flex items-center gap-4">
            <FaPhoneAlt className="text-white text-xl" />
            <div>
              <p className="font-semibold text-gray-400">Phone</p>
              <p className="text-gray-400">+91 98765 43210</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <FaEnvelope className="text-white text-xl" />
            <div>
              <p className="font-semibold text-gray-400">Email</p>
              <p className="text-gray-400">contact@zivaas.in</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <FaMapMarkerAlt className="text-white text-xl" />
            <div>
              <p className="font-semibold text-gray-400">Office</p>
              <p className="text-gray-400">Ahmedabad, Gujarat, India</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-500 mt-8 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Zivaas Properties. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
