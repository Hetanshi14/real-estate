import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../Components/Hero';
import { allProperties } from '../data/properties';

const Home = () => {
  return (
    <div className="bg-rose-50 min-h-screen">
      <Hero />

      <section className="bg-cover bg-center h-[60vh] flex items-center justify-center text-white text-center px-4">
        <div className="bg-stone-700 p-6 rounded">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Dream Property</h1>
          <p className="mb-6 text-lg">Buy | Sell | Rent | Upcoming Projects</p>
          <div className="flex justify-center gap-1">
            <input
              type="text"
              placeholder="Search by city, project, builder..."
              className="px-4 py-2 w-full max-w-md rounded-l border"
            />
            <button className="border rounded-r text-white px-4 py-2 hover:bg-white hover:text-stone-700">
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto py-5 px-4 text-center">
        <h2 className="text-stone-700 text-2xl font-bold mb-6">Explore Options</h2>
        <div className="flex flex-wrap justify-center gap-6">
          <Link to="/listings" className="bg-stone-700 text-white shadow p-4 rounded hover:bg-white hover:text-stone-700 min-w-[150px]">
            🏠 Buy
          </Link>
          <Link to="/listings" className="bg-stone-700 text-white shadow p-4 rounded hover:bg-white hover:text-stone-700 min-w-[150px]">
            🏘️ Rent
          </Link>
          <Link to="/booking" className="bg-stone-700 text-white shadow p-4 rounded hover:bg-white hover:text-stone-700 min-w-[150px]">
            🛒 Sell
          </Link>
          <Link to="/upcoming" className="bg-stone-700 text-white shadow p-4 rounded hover:bg-white hover:text-stone-700 min-w-[150px]">
            🚧 Upcoming Projects
          </Link>
        </div>
      </section>

      <section className="max-w-6xl max-h-7xl mx-auto py-12 px-4">
        <h2 className="text-2xl text-stone-700 font-semibold mb-6 text-center">Featured Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {allProperties.slice(0, 3).map((property) => (
            <div key={property.id} className="shadow rounded text-center">
              <div className="relative group h-64 w-full overflow-hidden rounded-t">
                <img
                  src={property.image}
                  alt={property.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-transparent bg-opacity- backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-left text-white">
                    <h3 className="text-lg font-semibold">{property.name}</h3>
                    <p className="text-sm">
                      {property.location} • {property.bhk} BHK • ₹{Number(property.price).toLocaleString()}
                    </p>
                    <Link
                      to={`/detail/${property.id}`}
                      className="inline-block text-rose-100 hover:underline mt-1">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-rose-100 py-12 px-4 text-center">
        <h2 className="text-2xl text-stone-700 font-bold mb-6">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-stone-700 p-6 rounded shadow">
            <p className="italic text-white mb-3">"Zivaas helped me find the perfect flat in my budget. Great service!"</p>
            <h4 className="font-semibold text-rose-200">— Ramesh Patel</h4>
          </div>
          <div className="bg-stone-700 p-6 rounded shadow">
            <p className="italic text-white mb-3">"Very professional team and quick response. Highly recommended!"</p>
            <h4 className="font-semibold text-rose-200">— Riya Shah</h4>
          </div>
        </div>
      </section>

      <section className="bg-rose-100 text-stone-700 py-12 text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Ready to Book a Site Visit?</h2>
        <p className="mb-6">Get expert advice and see properties firsthand.</p>
        <Link
          to="/booking"
          className="bg-white text-rose-300 font-medium px-6 py-2 rounded hover:bg-rose-200 hover:text-stone-700"
        >
          Book Now
        </Link>
      </section>

      <section className="bg-rose-200 text-stone-700 py-10 text-center">
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
