import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import bglisting from '../assets/bglisting.jpg';
import { motion } from 'framer-motion';

const FilterBar = ({ filters, setFilters, clearFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 justify-center items-center p-4 max-w-6xl mx-auto">
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
        name="type"
        value={filters.type}
        onChange={handleChange}
        className="border bg-stone-200 text-stone-700 border-stone-300 p-2 rounded w-[150px] md:w-[170px]"
      >
        <option value="">Type</option>
        <option value="Residential">Residential</option>
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
      <div className="flex space-x-2">
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
        <button
          onClick={clearFilters}
          className="bg-yellow-600 text-white px-4 py-2 rounded shadow hover:bg-yellow-500 transition"
        >
          Clear Filters
        </button>
      </div>
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
  const [page, setPage] = useState(1);
  const perPage = 9;

  const [filters, setFilters] = useState(() => {
    const stored = localStorage.getItem('zivaasFilters');
    return stored
      ? JSON.parse(stored)
      : {
          location: '',
          price: '',
          type: '',
          status: '',
          sort: '',
        };
  });

  const sectionRefs = useRef([]);
  const [visibleSections, setVisibleSections] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('Fetching properties with builders from Supabase');
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select(`
            id, name, property_type, images, builder_id, price, location, status, configuration,
            builders (id, name, logo_url)
          `);

        if (propertiesError) {
          console.error('Properties fetch error:', propertiesError.message);
          throw new Error('Failed to fetch properties: ' + propertiesError.message);
        }

        const mappedProperties = propertiesData.map((p) => ({
          id: p.id,
          name: p.name,
          type: p.property_type || 'Unknown',
          bhk: p.configuration ? parseInt(p.configuration) || 0 : 0,
          price: p.price ? parseFloat(p.price) : 0,
          location: p.location || 'Unknown',
          status: p.status || 'Unknown',
          progress: p.status === 'Upcoming' ? 0 : 1,
          image: p.images && p.images.length > 0
            ? p.images[0]
            : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
          builder: p.builders?.name || 'Unknown Builder',
          builder_logo: p.builders?.logo_url || 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//logo.png',
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
  }, [location]);

  useEffect(() => {
    localStorage.setItem('zivaasFilters', JSON.stringify(filters));

    let result = [...allProps];

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery) ||
          p.builder.toLowerCase().includes(searchQuery) ||
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
        const price = p.price;
        if (filters.price === '15000000+') return price >= 15000000;
        return price >= min && (max ? price <= max : true);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !visibleSections.includes(entry.target.id)) {
            setVisibleSections((prev) => [...prev, entry.target.id]);
          }
        });
      },
      { threshold: 0.2 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [visibleSections]);

  const clearFilters = () => {
    setFilters({
      location: '',
      price: '',
      type: '',
      status: '',
      sort: '',
    });
    localStorage.removeItem('zivaasFilters');
    setPage(1);
  };

  const isVisible = (id) => visibleSections.includes(id);

  const totalPages = Math.ceil(filteredProperties.length / perPage);
  const paginatedProperties = filteredProperties.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen">
      <section
        id="section1"
        ref={(el) => (sectionRefs.current[0] = el)}
        className={`relative bg-cover bg-center text-white h-[80vh] flex items-center p-20 transition-all duration-1000 transform ${
          isVisible('section1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ backgroundImage: `url(${bglisting})` }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 px-4 max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Explore Properties</h1>
          <p className="text-2xl max-w-xl mx-auto">
            Discover a wide range of premium residential and commercial properties curated by Zivaas Properties.
          </p>
        </div>
      </section>

      <section
        id="section2"
        ref={(el) => (sectionRefs.current[1] = el)}
        className={`max-w-6xl mx-auto py-12 px-4 transition-all duration-1000 transform ${
          isVisible('section2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">Available Properties</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        <FilterBar filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
          {paginatedProperties.length > 0 ? (
            paginatedProperties.map((property) => (
              <div key={property.id} className="rounded shadow hover:shadow-lg transition text-white">
                <div className="relative group h-[300px] w-full overflow-hidden rounded">
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
                      <p className="text-sm">
                        {property.bhk ? `${property.bhk} BHK • ` : ''}₹{property.price.toLocaleString()}
                      </p>
                      <p className="text-sm">{property.type} • {property.status}</p>
                      <p className="text-sm">Built by: {property.builder}</p>
                      <Link
                        to={`/listings/${property.id}`}
                        className="inline-block text-rose-100 hover:underline mt-1"
                      >
                        View Details
                      </Link>
                    </div>
                    <div className="absolute top-4 left-4">
                      <img
                        src={property.builder_logo}
                        alt={`${property.builder} logo`}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load builder logo:', e.target.src);
                          e.target.src =
                            'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//default%20logo.jpg';
                        }}
                      />
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
        {filteredProperties.length > perPage && (
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="bg-yellow-600 text-white px-4 py-2 rounded shadow hover:bg-yellow-500 transition disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-stone-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="bg-yellow-600 text-white px-4 py-2 rounded shadow hover:bg-yellow-500 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Listings;