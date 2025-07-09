import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import FilterBar from '../Components/FilterBar';
import PropertyCard from '../Components/PropertyCard';
import { allProperties as staticProperties } from '../data/properties';
import bglisting from '../assets/bglisting.jpg';
import { motion } from 'framer-motion';

const Listings = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const [filteredProperties, setFilteredProperties] = useState([]);
  const [allProps, setAllProps] = useState([]);

  const [filters, setFilters] = useState(() => {
    const stored = localStorage.getItem('zivaasFilters');
    return stored
      ? JSON.parse(stored)
      : {
          location: '',
          price: '',
          bhk: '',
          type: '',
          status: '',
          sort: '',
        };
  });

  useEffect(() => {
    const storedProps = JSON.parse(localStorage.getItem('zivaas_properties')) || [];
    const combined = [...staticProperties, ...storedProps];
    setAllProps(combined);
  }, []);

  useEffect(() => {
    localStorage.setItem('zivaasFilters', JSON.stringify(filters));

    let result = [...allProps];

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery) ||
          p.builder?.toLowerCase().includes(searchQuery) ||
          p.location.toLowerCase().includes(searchQuery)
      );
    }

    if (filters.location) {
      result = result.filter((p) =>
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.price) {
      const max = parseInt(filters.price);
      result = result.filter((p) => parseInt(p.price) <= max);
    }

    if (filters.bhk) {
      result = result.filter((p) => p.bhk.toString() === filters.bhk);
    }

    if (filters.type) {
      result = result.filter((p) => p.type === filters.type);
    }

    if (filters.status === 'Upcoming') {
      result = result.filter((p) => p.progress === 0);
    } else if (filters.status) {
      result = result.filter((p) => p.status === filters.status && p.progress > 0);
    }

    if (filters.sort === 'priceLowHigh') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'priceHighLow') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProperties(result);
  }, [filters, allProps, searchQuery]);

  return (
    <div className="min-h-screen">
      <section
        className="relative bg-cover bg-center text-white h-[80vh] flex items-center p-20 justify-items-start"
        style={{ backgroundImage: `url(${bglisting})` }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />

        <motion.div
          className="relative z-10 px-4 max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Explore Properties</h1>
          <p className="text-2xl max-w-xl mx-auto">
            Discover a wide range of premium residential and commercial properties curated by Zivaas Properties.
          </p>
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">Available Properties</h2>
        <FilterBar filters={filters} setFilters={setFilters} />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProperties.slice(0, 9).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Listings;
