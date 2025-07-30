import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import validator from "validator";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!validator.isEmail(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      // Simulate successful subscription
      setMessage("Subscribed successfully!");
      setIsModalOpen(true); // Open modal for success message
      setEmail(""); // Clear the input field
    } catch (error) {
      setMessage("An error occurred. Please try again later.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMessage(""); // Clear message when closing modal
  };

  return (
    <footer className="bg-stone-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-stone-100">
            Zivaas Properties
          </h2>
          <p className="text-gray-400 leading-relaxed">
            A trusted leader in real estate, offering premium flats, plots, and
            commercial spaces designed for luxury living and sustainable growth.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-5 text-stone-200">
            Quick Links
          </h3>
          <ul className="space-y-3">
            <li>
              <Link
                to="/"
                className="relative inline-block after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/listings"
                className="relative inline-block after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
              >
                Listings
              </Link>
            </li>
            <li>
              <Link
                to="/developer"
                className="relative inline-block after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
              >
                Developer
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="relative inline-block after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="relative inline-block after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-5 text-stone-200">
            Contact Us
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <FaPhoneAlt className="text-stone-300 text-xl" />
              <div>
                <p className="font-medium text-gray-400">Phone</p>
                <a
                  href="tel:+919876543210"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  +91 98765 43210
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <FaEnvelope className="text-stone-300 text-xl" />
              <div>
                <p className="font-medium text-gray-400">Email</p>
                <a
                  href="mailto:contact@zivaas.in"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  contact@zivaas.in
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <FaMapMarkerAlt className="text-stone-300 text-xl" />
              <div>
                <p className="font-medium text-gray-400">Office</p>
                <p className="text-gray-300">Ahmedabad, Gujarat, India</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-5 text-stone-200">
            Newsletter
          </h3>
          <p className="text-gray-400 mb-4 text-sm leading-tight">
            Stay updated with the latest properties and offers. Subscribe now!
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-2 py-1 rounded-lg bg-stone-700 border border-stone-600 text-gray-300 focus:outline-none focus:ring-2 focus:ring-stone-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className="bg-stone-600 hover:bg-stone-500 text-white px-4 py-1 rounded-lg transition-colors duration-200 flex items-center"
            >
              <FaPaperPlane className="mr-2" /> Subscribe
            </button>
          </form>
          {message && !isModalOpen && (
            <p className="mt-2 text-sm text-red-400">{message}</p>
          )}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-stone-200 mb-3">
              Follow Us
            </h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FaFacebookF className="text-xl" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FaTwitter className="text-xl" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FaInstagram className="text-xl" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FaLinkedinIn className="text-xl" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-600 mt-8 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Zivaas Properties. All rights reserved. 
      </div>

      {/* Modal for Success Message */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold text-green-600 mb-4">
              Subscription Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              Thank you for subscribing to our newsletter. You'll receive
              updates on the latest properties and offers.
            </p>
            <button
              onClick={closeModal}
              className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600 
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;