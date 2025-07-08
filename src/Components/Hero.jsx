import React from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/heroImg.jpg';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section
      className="relative bg-cover bg-center text-white h-[100vh] flex items-center justify-center"
      style={{ backgroundImage: `url(${heroImg})` }}>

      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="p-8 rounded-lg text-center max-w-2xl mx-auto">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Find Your Dream Property with Zivaas
          </motion.h1>

          <motion.p
            className="text-lg mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Explore luxury flats, spacious plots, and premium upcoming projects across India.
          </motion.p>

          <motion.div
            className="flex flex-col md:flex-row justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link
              to="/listings"
              className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
                before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-white
                before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-stone-700">
              Browse Listings
            </Link>
            <Link
              to="/booking"
              className="relative inline-block px-6 py-2 rounded font-medium text-white border border-white z-10 overflow-hidden
                before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-700
                before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:border-none hover:text-white">
              Book a Visit
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
