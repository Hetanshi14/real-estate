import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import FilterBar from '../Components/FilterBar';
import PropertyCard from '../components/PropertyCard';
import { allProperties as staticProperties } from '../data/properties';

const Listing = () => {
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
    if (filters.status) {
      result = result.filter((p) => p.status === filters.status);
    }

    if (filters.sort === 'priceLowHigh') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'priceHighLow') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProperties(result);
  }, [filters, allProps, searchQuery]); 

  return (
    <div className="min-h-screen bg-rose-50 px-3 py-5">
      <h1 className="text-3xl font-bold text-stone-700 mb-6 text-center">Available Properties</h1>
      <FilterBar filters={filters} setFilters={setFilters} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {filteredProperties.length === 0 ? (
          <p className="text-center col-span-full text-stone-500">No matching properties found.</p>
        ) : (
          filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        )}
      </div>
    </div>
  );
};

export default Listing;
