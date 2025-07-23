import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaMapMarkerAlt, FaMoneyBill, FaBuilding, FaHome, FaRulerCombined } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Default image URL
const DEFAULT_IMAGE = 'https://via.placeholder.com/300x300?text=No+Image';

const FilterBar = ({ filters, setFilters, clearFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updatedFilters = { ...prev, [name]: value };
      localStorage.setItem('zivaasFilters', JSON.stringify(updatedFilters));
      return updatedFilters;
    });
  };

  const removeFilter = (filterName) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev, [filterName]: '' };
      localStorage.setItem('zivaasFilters', JSON.stringify(updatedFilters));
      return updatedFilters;
    });
  };

  const activeFilters = Object.entries(filters).filter(([key, value]) => value && key !== 'sort');

  return (
    <motion.div
      className="w-full md:w-64 bg-white p-6 h-fit rounded-lg shadow-lg border border-stone-200 sticky top-20 z-20"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-xl font-serif text-stone-800 mb-4 border-b border-stone-300 pb-2">Filter Properties</h3>
      {activeFilters.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-stone-600 mb-2">Selected Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(([key, value]) => (
              <span
                key={key}
                className="bg-stone-100 text-stone-700 text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1"
              >
                <span>
                  {key === 'price'
                    ? value.replace('-', ' - ').replace('15000000+', '₹1.5cr+')
                    : key === 'area'
                    ? `${value} sq.ft`
                    : value}
                </span>
                <button
                  onClick={() => removeFilter(key)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
            <FaMapMarkerAlt className="mr-2" /> Location
          </label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            placeholder="Enter location"
            className="w-full border border-stone-300 bg-stone-50 text-stone-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
            <FaMoneyBill className="mr-2" /> Price Range
          </label>
          <select
            name="price"
            value={filters.price}
            onChange={handleChange}
            className="w-full border border-stone-300 bg-stone-50 text-stone-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
          >
            <option value="">Any</option>
            <option value="0-5000000">0-₹50L</option>
            <option value="5000000-7000000">₹50L-₹70L</option>
            <option value="7000000-10000000">₹70L-₹1cr</option>
            <option value="10000000-15000000">₹1cr-₹1.5cr</option>
            <option value="15000000+">₹1.5cr+</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
            <FaRulerCombined className="mr-2" /> Area (sq.ft)
          </label>
          <input
            type="text"
            name="area"
            value={filters.area}
            onChange={handleChange}
            placeholder="e.g., 1000 or 1500+"
            className="w-full border border-stone-300 bg-stone-50 text-stone-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
            <FaBuilding className="mr-2" /> Property Type
          </label>
          <select
            name="property_type"
            value={filters.property_type}
            onChange={handleChange}
            className="w-full border border-stone-300 bg-stone-50 text-stone-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
          >
            <option value="">Any</option>
            <option value="Flat">Flat</option>
            <option value="Villa">Villa</option>
            <option value="Plot">Plot</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
            <FaHome className="mr-2" /> Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full border border-stone-300 bg-stone-50 text-stone-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
          >
            <option value="">Any</option>
            <option value="Ready">Ready to Move</option>
            <option value="Under Construction">Under Construction</option>
            <option value="Upcoming">Upcoming</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">Sort</label>
          <select
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            className="w-full border border-stone-300 bg-stone-50 text-stone-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
          >
            <option value="">Sort</option>
            <option value="priceLowHigh">Price: Low to High</option>
            <option value="priceHighLow">Price: High to Low</option>
          </select>
        </div>
        <button
          onClick={clearFilters}
          className="w-full bg-stone-700 text-white py-2 rounded-md hover:bg-stone-600 transition duration-300"
        >
          Clear Filters
        </button>
      </div>
    </motion.div>
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
          area: '',
          property_type: '',
          status: '',
          sort: '',
        };
  });

  const [userRole, setUserRole] = useState(null);
  const sectionRefs = useRef([]);
  const [visibleSections, setVisibleSections] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, wishlist_criteria')
            .eq('id', user.id)
            .single();
          if (userError) {
            console.error('Error fetching user data:', userError);
            setError(`Error fetching user data: ${userError.message}`);
            setUserRole(null);
            return;
          }
          setUserRole(userData.role);
          if (userData.role === 'customer' && userData.wishlist_criteria) {
            const validTypes = ['Flat', 'Villa', 'Plot', 'Commercial'];
            const wishlistCriteria = {
              location: userData.wishlist_criteria.location || '',
              price: userData.wishlist_criteria.price || '',
              area: userData.wishlist_criteria.area || '',
              property_type: userData.wishlist_criteria.property_type || '',
              status: userData.wishlist_criteria.status || '',
              sort: filters.sort || '', // Preserve existing sort if any
            };
            console.log('Fetched wishlist_criteria:', wishlistCriteria);
            setFilters((prev) => ({
              ...prev,
              ...wishlistCriteria,
            }));
            localStorage.setItem('zivaasFilters', JSON.stringify(wishlistCriteria));
          }
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(`Error fetching user data: ${error.message}`);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('Fetching properties from Supabase');
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select(`
            id, name, property_type, images, developer_id, price, location, status, configuration, carpet_area,
            users (
              id,
              username,
              email,
              role
            )
          `);

        if (propertiesError) {
          console.error('Supabase Error Details:', propertiesError);
          throw new Error(`Failed to fetch properties: ${propertiesError.message} (Code: ${propertiesError.code})`);
        }

        console.log('Raw properties data:', propertiesData);

        if (!propertiesData || propertiesData.length === 0) {
          console.warn('No properties data returned from Supabase');
          setAllProps([]);
          setError('No properties found in the database.');
          return;
        }

        const mappedProperties = propertiesData.map((p) => {
          const typeValue = p.property_type ? p.property_type.charAt(0).toUpperCase() + p.property_type.slice(1).toLowerCase() : 'Unknown';
          console.log(`Mapping property ${p.id}: property_type=${p.property_type}, mapped type=${typeValue}`);
          return {
            id: p.id,
            name: p.name || 'Unnamed Property',
            type: typeValue,
            bhk: p.configuration ? parseInt(p.configuration) || 0 : 0,
            price: p.price ? parseFloat(p.price) : 0,
            location: p.location || 'Unknown',
            status: p.status || 'Unknown',
            progress: p.status === 'Upcoming' ? 0 : 1,
            image: p.images ? p.images.split(',')[0] || null : null,
            developer: p.users?.username || 'Unknown Developer',
            developer_logo: p.users?.email
              ? `https://via.placeholder.com/50?text=${encodeURIComponent(p.users.email)}`
              : 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//default%20logo.jpg',
            carpet_area: p.carpet_area || 0,
          };
        });

        console.log('Mapped properties:', mappedProperties);
        setAllProps(mappedProperties);
        setError(null);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError(`Error loading properties: ${error.message}. Check console for details.`);
        setAllProps([]);
      }
    };

    fetchProperties();
  }, [location]);

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.role === 'developer' || userRole === 'developer') return;

      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlist')
        .select('property_id')
        .eq('user_id', user.id);

      if (wishlistError) {
        console.error('Error fetching wishlist:', wishlistError);
        setError(`Error fetching wishlist: ${wishlistError.message}`);
        return;
      }

      const wishlistIds = wishlistData.map((item) => item.property_id);

      setAllProps((prev) =>
        prev.map((prop) => ({
          ...prop,
          isInWishlist: wishlistIds.includes(prop.id),
        }))
      );
    };

    fetchWishlistStatus();
  }, [allProps.length, userRole]);

  useEffect(() => {
    let result = [...allProps];

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery) ||
          p.developer.toLowerCase().includes(searchQuery) ||
          p.location.toLowerCase().includes(searchQuery)
      );
    }

    if (filters.location) {
      result = result.filter((p) =>
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.price) {
      result = result.filter((p) => {
        const price = parseFloat(p.price) || 0;
        const [min, max] = filters.price
          .split('-')
          .map((p) => (p === '+' ? Infinity : parseFloat(p.replace(/[^0-9]/g, '')) || 0));
        return min <= price && (max === Infinity ? true : price <= max);
      });
    }

    if (filters.area) {
      result = result.filter((p) => {
        const propArea = parseInt(p.carpet_area) || 0;
        const critArea = parseInt(filters.area.replace('+', '')) || 0;
        return filters.area.includes('+') ? propArea >= critArea : propArea === critArea;
      });
    }

    if (filters.property_type) {
      result = result.filter((p) => p.type.toLowerCase() === filters.property_type.toLowerCase());
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

    console.log('Filtered properties:', result);
    setFilteredProperties(result);
    setPage(1); // Reset to first page when filters change
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
    const clearedFilters = {
      location: '',
      price: '',
      area: '',
      property_type: '',
      status: '',
      sort: '',
    };
    setFilters(clearedFilters);
    localStorage.setItem('zivaasFilters', JSON.stringify(clearedFilters));
    setPage(1);
  };

  const isVisible = (id) => visibleSections.includes(id);

  const totalPages = Math.ceil(filteredProperties.length / perPage);
  const paginatedProperties = filteredProperties.slice((page - 1) * perPage, page * perPage);

  const toggleWishlist = async (propertyId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.role === 'developer' || userRole === 'developer') {
      setError('Developers cannot manage wishlist.');
      return;
    }

    try {
      const property = allProps.find((p) => p.id === propertyId);
      if (property.isInWishlist) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);

        if (error) throw new Error(`Failed to remove from wishlist: ${error.message}`);

        setAllProps((prev) =>
          prev.map((prop) =>
            prop.id === propertyId ? { ...prop, isInWishlist: false } : prop
          )
        );
        alert('Property removed from wishlist!');
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, property_id: propertyId });

        if (error) {
          if (error.code === '23505') {
            setError('This property is already in your wishlist.');
          } else {
            throw new Error(`Failed to add to wishlist: ${error.message}`);
          }
        } else {
          setAllProps((prev) =>
            prev.map((prop) =>
              prop.id === propertyId ? { ...prop, isInWishlist: true } : prop
            )
          );
          alert('Property added to wishlist!');
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section
        id="section1"
        ref={(el) => (sectionRefs.current[0] = el)}
        className={`relative bg-cover bg-center text-white h-[80vh] flex items-center p-20 transition-all duration-1000 transform ${isVisible('section1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ backgroundImage: `url(https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Bg%20img/bglisting.jpg)` }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 px-4 max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 transition-opacity duration-600" style={{ opacity: 1, transform: 'translateX(0)' }}>
            Explore Properties
          </h1>
          <p className="text-2xl max-w-xl mx-auto transition-opacity duration-600" style={{ opacity: 1, transform: 'translateX(0)' }}>
            Discover a wide range of premium residential and commercial properties curated by Zivaas Properties.
          </p>
        </div>
      </section>

      {/* Properties Section */}
      <section
        id="section2"
        ref={(el) => (sectionRefs.current[1] = el)}
        className={`max-w-7xl mx-auto py-12 transition-all duration-1000 transform grid grid-cols-[auto_1fr] gap-6 ${isVisible('section2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-30'}`}
      >
        {/* FilterBar */}
        <FilterBar filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
        <div>
          {/* Properties Grid on the right */}
          <div className="w-full">
            <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center md:text-left">Available Properties</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10 mr-3">
              {paginatedProperties.length > 0 ? (
                paginatedProperties.map((property, index) => (
                  <div key={property.id} className="rounded shadow hover:shadow-lg transition text-white">
                    <div className="relative group h-[300px] w-full overflow-hidden rounded">
                      <Link to={`/listings/${property.id}`}>
                        {property.image ? (
                          <img
                            src={property.image}
                            alt={property.name}
                            className="w-full h-full transition-transform duration-300 group-hover:scale-105 rounded"
                            onError={(e) => {
                              e.target.src = DEFAULT_IMAGE;
                              e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-200');
                              console.error('Image load failed:', property.image);
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-stone-700">
                            Image not uploaded
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black opacity-40 md:opacity-0 md:group-hover:opacity-40 transition-opacity duration-300 z-0"></div>
                        <div className="absolute inset-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                          <div className="absolute bottom-4 left-4 text-left">
                            <h3 className="text-lg font-semibold">{property.name}</h3>
                            <p className="text-sm">{property.location}</p>
                            <p className="text-sm">
                              {property.bhk ? `${property.bhk} BHK • ` : ''}₹{property.price.toLocaleString()}
                            </p>
                            <p className="text-sm">{property.type || 'Unknown Type'} • {property.status || 'Unknown Status'}</p>
                            <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              Built by: {property.developer}
                            </p>
                            <div className="mt-1">
                              <Link
                                to={`/listings/${property.id}`}
                                className="underline text-white hover:font-semibold"
                              >
                                View Details
                              </Link>
                            </div>
                            {userRole === 'customer' && property.isInWishlist !== undefined && (
                              <div className="mt-1">
                                <Link
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleWishlist(property.id);
                                  }}
                                  className="text-stone-100 hover:font-semibold"
                                >
                                  {property.isInWishlist ? 'Remove' : 'Add to Wishlist'}
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-stone-600 text-lg col-span-full">
                  {error || 'No properties found in the database.'}
                </p>
              )}
            </div>
            {filteredProperties.length > perPage && (
              <div className="flex justify-center mt-6 space-x-4">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
                    before:absolute before:right-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-stone-700">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="relative inline-block px-6 py-2 mr-3 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
                    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Listings;
