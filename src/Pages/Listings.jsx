import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import bglisting from '../assets/bglisting.jpg';
import { motion } from 'framer-motion';

const FilterBar = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 justify-center items-center p-4 max-w-8xl mx-auto">
      <input
        type="text"
        name="location"
        value={filters.location}
        onChange={handleChange}
        placeholder="Location"
        className="border bg-stone-200 text-stone-700 border-stone-300 p-2 rounded w-[150px] md:w-[170px]"
      />
      <select
        name="price"
        value={filters.price}
        onChange={handleChange}
        className="border bg-stone-200 text-stone-700 border-stone-300 p-2 rounded w-[150px] md:w-[170px]"
      >
        <option value="">Price</option>
        <option value="0-5000000">0-₹50L</option>
        <option value="5000000-7000000">₹50L-₹70L</option>
        <option value="7000000-10000000">₹70L-₹1cr</option>
        <option value="10000000-15000000">₹1cr-₹1.5cr</option>
        <option value="15000000+">₹1.5cr+</option>
      </select>
      <select
        name="bhk"
        value={filters.bhk}
        onChange={handleChange}
        className="border bg-stone-200 text-stone-700 border-stone-300 p-2 rounded w-[150px] md:w-[170px]"
      >
        <option value="">BHK</option>
        <option value="1">1 BHK</option>
        <option value="2">2 BHK</option>
        <option value="3">3 BHK</option>
        <option value="4">4+ BHK</option>
      </select>
      <select
        name="type"
        value={filters.type}
        onChange={handleChange}
        className="border bg-stone-200 text-stone-700 border-stone-300 p-2 rounded w-[150px] md:w-[170px]"
      >
        <option value="">Type</option>
        <option value="Flat">Flat</option>
        <option value="Villa">Villa</option>
        <option value="Plot">Plot</option>
        <option value="Commercial">Commercial</option>
      </select>
      <select
        name="status"
        value={filters.status}
        onChange={handleChange}
        className="border bg-stone-200 text-stone-700 border-stone-300 p-2 rounded w-[150px] md:w-[170px]"
      >
        <option value="">Status</option>
        <option value="Ready">Ready to Move</option>
        <option value="Under Construction">Under Construction</option>
        <option value="Upcoming">Upcoming</option>
      </select>
      <select
        name="sort"
        value={filters.sort}
        onChange={handleChange}
        className="border bg-stone-200 text-stone-700 border-stone-300 p-2 rounded w-[150px] md:w-[170px]"
      >
        <option value="">Sort</option>
        <option value="priceLowHigh">Price: Low to High</option>
        <option value="priceHighLow">Price: High to Low</option>
      </select>
    </div>
  );
};

const Listings = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const [filteredProperties, setFilteredProperties] = useState([]);
  const [allProps, setAllProps] = useState([]);
  const [error, setError] = useState(null);

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
    const fetchProperties = async () => {
      try {
        console.log('Fetching all properties from Supabase');
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*');

        if (propertiesError) {
          console.error('Properties fetch error:', propertiesError.message);
          throw new Error('Failed to fetch properties.');
        }

        // Map data to match filtering and PropertyCard expectations
        const mappedProperties = propertiesData.map((p) => ({
          ...p,
          builder: p.developer_name, // Map developer_name to builder
          type: p.property_type, // Map property_type to type
          bhk: parseInt(p.configuration) || 0, // Extract number from configuration (e.g., "3BHK" → 3)
          progress: p.status === 'Upcoming' ? 0 : 1, // Set progress based on status
          image: p.images && p.images.length > 0
            ? p.images[0]
            : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80', // Use first image or fallback
        }));

        console.log('Mapped properties:', mappedProperties);
        setAllProps(mappedProperties);
        setError(null);
      } catch (error) {
        console.error('Error fetching properties:', error.message);
        setError(error.message);
        setAllProps([]);
      }
    };

    fetchProperties();
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
      const [min, max] = filters.price.split('-').map(Number);
      result = result.filter((p) => {
        const price = parseFloat(p.price);
        if (filters.price === '10000000') return price >= 10000000;
        return price >= min && (max ? price <= max : true);
      });
    }

    if (filters.bhk) {
      result = result.filter((p) => {
        if (filters.bhk === '4') return p.bhk >= 4;
        return p.bhk.toString() === filters.bhk;
      });
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        <FilterBar filters={filters} setFilters={setFilters} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProperties.length > 0 ? (
            filteredProperties.slice(0, 9).map((property) => (
              <div key={property.id} className="rounded max-w-6xl max-h-8xl shadow hover:shadow-lg transition text-white">
                <div className="relative group h-100 w-full overflow-hidden rounded">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded"
                    onError={(e) => {
                      console.error('Failed to load property image:', e.target.src);
                      e.target.src =
                        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-black opacity-40 md:opacity-0 md:group-hover:opacity-40 transition-opacity duration-300 z-0"></div>
                  <div className="absolute inset-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                    <div className="absolute bottom-4 left-4 text-left">
                      <h3 className="text-lg font-semibold">{property.name}</h3>
                      <p className="text-sm">{property.location}</p>
                      <p className="text-sm">{property.bhk} BHK • ₹{property.price.toLocaleString()}</p>
                      <p className="text-sm">{property.type} • {property.status}</p>
                      <Link
                        to={`/listings/${property.id}`}
                        className="inline-block text-rose-100 hover:underline mt-1"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-stone-600 text-lg col-span-full">
              No properties found matching your criteria.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Listings;
