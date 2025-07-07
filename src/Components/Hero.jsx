import React from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/heroImg.jpg';

const Hero = () => {
  return (
    <section
      className="bg-cover bg-opacity-50 bg-center  text-white h-[100vh] flex items-center justify-center"
      style={{ backgroundImage: `url(${heroImg})` }}>
      <div className="relative bg-white/10 backdrop-blur-xl max-w-6xl mx-auto">
        <div className="p-8 rounded-lg text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Dream Property with Zivaas
          </h1>
          <p className="text-lg mb-6">
            Explore luxury flats, spacious plots, and premium upcoming projects across India.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link
              to="/listings"
              className="bg-stone-700 text-white hover:bg-white hover:text-stone-700 py-2 px-6 rounded">
              Browse Listings
            </Link>
            <Link
              to="/booking"
              className="bg-transparent border border-stone-700 hover:bg-stone-700 hover:text-white text-stone-700 py-2 px-6 rounded">
              Book a Visit
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
