import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Hero from '../Components/Hero';
import PropertyCard from '../Components/PropertyCard';
import { allProperties } from '../data/properties';
import heroImg from '../assets/heroImg.jpg';

const Home = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchInput.trim() !== '') {
      navigate(`/listings?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const filteredProperties = allProperties.filter((property) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Residential') return ['Flat', 'Villa', 'Plot'].includes(property.type);
    if (selectedFilter === 'Commercial') return ['Office', 'Shop', 'Commercial'].includes(property.type);
    if (selectedFilter === 'Ready') return property.status === 'Ready';
    if (selectedFilter === 'Ongoing') return property.status === 'Under Construction';
     if (selectedFilter === 'Upcoming') return property.status === 'Upcoming' && property.progress === 0;
    return true;
  });

  return (
    <div className="min-h-screen">
      <Hero />

      <section className="bg-cover bg-center h-[60vh] pt-24 flex items-center justify-center text-white text-center px-4">
        <div className="bg-white shadow-md p-6 rounded">
          <h1 className="text-4xl md:text-5xl text-stone-700 font-bold mb-4">Find Your Dream Property</h1>
          <p className="mb-6 text-lg text-stone-700">Buy | Sell | Rent | Upcoming Projects</p>
          <div className="flex justify-center gap-1">
            <input
              type="text"
              placeholder="Search by location, builder, or project..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="px-4 py-2 w-full max-w-md rounded-l border text-stone-700 bg-stone-50 shadow"
            />
            <button
              onClick={handleSearch}
              className="border rounded-r text-stone-700 px-4 py-2 hover:bg-stone-700 hover:text-white shadow"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="text-stone-700 bg-stone-200 shadow-md py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
              Our Legacy of <span className="text-stone-500">Excellence</span>
            </h2>
            <p className="mb-4 text-lg">
              For over two decades, Zivaas Properties has been crafting exceptional living spaces that balance
              aesthetic beauty with practical functionality. Our commitment to quality and attention to detail
              has established us as leaders in luxury real estate development.
            </p>
            <p className="mb-6 text-base">
              From conceptualization to completion, we partner with our clients to transform their vision into
              reality, creating spaces that reflect their unique lifestyle and aspirations.
            </p>
            <Link to="/about" className="inline-block bg-stone-700 text-white px-5 py-2 rounded hover:bg-stone-500 transition">
              Discover Our Story
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { stat: '20+', label: 'Years of Experience' },
              { stat: '100+', label: 'Projects Completed' },
              { stat: '75+', label: 'Happy Clients' },
              { stat: '40+', label: 'Industry Awards' },
            ].map(({ stat, label }, i) => (
              <div key={i} className="bg-white rounded shadow p-6 text-center">
                <div className="text-3xl font-bold text-stone-800 mb-2">{stat}</div>
                <p className="text-sm font-medium text-stone-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-4xl text-stone-700 font-semibold mb-2 text-center">Featured Properties</h2>
        <p className="text-center text-lg text-stone-500 mb-6">
          Discover our portfolio of exceptional properties designed with innovation and built with precision.
        </p>

        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {['All', 'Residential', 'Commercial', 'Ready', 'Ongoing', 'Upcoming'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full border ${selectedFilter === filter
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100'
                } transition`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProperties.slice(0, 3).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="flex justify-center mt-8 mb-8">
          <Link
            to="/listings"
            className="bg-yellow-600 text-white px-6 py-3 rounded hover:bg-yellow-700 transition font-medium shadow"
          >
            View All
          </Link>
        </div>
      </section>

      <section
        className="relative h-screen bg-cover bg-center text-white flex flex-col justify-center items-center text-center px-4"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Building Dreams with Zivaas
          </h1>
          <p className="mb-6 text-lg">
            Explore thoughtfully designed spaces crafted for comfort, elegance, and modern living.
          </p>
          <div className="flex justify-center gap-4 flex-wrap mb-10">
            <Link
              to="/listings"
              className="bg-yellow-600 hover:bg-yellow-700 transition text-white font-medium px-6 py-3 rounded shadow"
            >
              View Projects →
            </Link>
            <Link
              to="/booking"
              className="border border-white text-white hover:bg-white hover:text-stone-700 transition font-medium px-6 py-3 rounded"
            >
              Schedule a Visit
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 max-w-3xl mx-auto">
            {[
              { number: '20+', label: 'Years of Experience' },
              { number: '500+', label: 'Happy Clients' },
              { number: '100%', label: 'Client Satisfaction' },
            ].map(({ number, label }, i) => (
              <div
                key={i}
                className="bg-black/50 backdrop-blur-sm rounded px-6 py-4 text-white shadow-md"
              >
                <h3 className="text-3xl font-bold mb-1">{number}</h3>
                <p className="text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 text-center">
        <h2 className="text-2xl text-stone-700 font-bold mb-6">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            {
              quote: "Zivaas helped me find the perfect flat in my budget. Great service!",
              author: "— Ramesh Patel",
            },
            {
              quote: "Very professional team and quick response. Highly recommended!",
              author: "— Riya Shah",
            },
          ].map(({ quote, author }, i) => (
            <div key={i} className="bg-stone-700 p-6 rounded shadow">
              <p className="italic text-white mb-3">"{quote}"</p>
              <h4 className="font-semibold text-rose-200">{author}</h4>
            </div>
          ))}
        </div>
      </section>

      <section className="text-stone-700 py-12 text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Ready to Book a Site Visit?</h2>
        <p className="mb-6">Get expert advice and see properties firsthand.</p>
        <Link
          to="/booking"
          className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
            before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-500 
            before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
        >
          Book Now
        </Link>
      </section>

      <section className="text-stone-700 py-10 text-center">
        <h2 className="text-xl font-bold mb-2">Have Questions?</h2>
        <p className="mb-4">We’d love to help you find your dream property.</p>
        <a href="tel:+919999999999" className="hover:font-bold underline text-stone-700">
          Call Us Now
        </a>
      </section>
    </div>
  );
};

export default Home;