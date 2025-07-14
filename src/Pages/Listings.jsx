import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const FilterBar = ({ filters, setFilters, clearFilters }) => {
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
        className="border bg-stone-200 text-stone-700 border-stone-300 p-2 rounded w-[130px] md:w-[150px]"
      />
      <select
        name="price"
        value={filters.price}
        onChange={handleChange}
        className="border bg-stone-200 text-stone-700 border-stone-300 p-2 rounded w-[130px] md:w-[150px]"
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
        className="border bg-stone-200 text-stone-700 border-stone-300 p-2 rounded w-[130px] md:w-[150px]"
      >
        <option value="">Type</option>
        <option value="Plot">Plot</option>
        <option value="Villa">Villa</option>
        <option value="Flat">Flat</option>
        <option value="Commercial">Commercial</option>
      </select>
      <select
        name="status"
        value={filters.status}
        onChange={handleChange}
        className="border bg-stone-200 text-stone-700 border-stone-300 p-2 rounded w-[130px] md:w-[150px]"
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
          className="border bg-stone-200 text-stone-700 border-stone-300 p-2 rounded w-[130px] md:w-[150px]"
        >
          <option value="">Sort</option>
          <option value="priceLowHigh">Price: Low to High</option>
          <option value="priceHighLow">Price: High to Low</option>
        </select>
      </div>
      <button
        onClick={clearFilters}
        className="relative inline-block px-4 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden w-auto
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white shadow transition"
      >
        Clear Filters
      </button>
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

  const [userRole, setUserRole] = useState(null); // New state to track user role

  const sectionRefs = useRef([]);
  const [visibleSections, setVisibleSections] = useState([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        if (userError) {
          console.error('Error fetching user role:', userError);
          setUserRole(null);
        } else {
          setUserRole(userData.role);
        }
      } else {
        setUserRole(null);
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('Fetching properties from Supabase');
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select(`
            id, name, property_type, images, builder_id, price, location, status, configuration,
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

        const mappedProperties = propertiesData.map((p) => ({
          id: p.id,
          name: p.name || 'Unnamed Property',
          type: p.property_type || 'Unknown',
          bhk: p.configuration ? parseInt(p.configuration) || 0 : 0,
          price: p.price ? parseFloat(p.price) : 0,
          location: p.location || 'Unknown',
          status: p.status || 'Unknown',
          progress: p.status === 'Upcoming' ? 0 : 1,
          image: p.images ? p.images.split(',')[0] || null : null, // Split the string and take the first URL
          builder: p.users?.username || 'Unknown Builder' || (p.builder_id ? 'Builder Not Found' : 'No Builder Assigned'),
          builder_logo: p.users?.email
            ? `https://via.placeholder.com/50?text=${encodeURIComponent(p.users.email)}`
            : 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//default%20logo.jpg',
        }));

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
      if (!user || user.role === 'builder' || userRole === 'builder') return; // Skip for builders

      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlist')
        .select('property_id')
        .eq('user_id', user.id);

      if (wishlistError) {
        console.error('Error fetching wishlist:', wishlistError);
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

  const toggleWishlist = async (propertyId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.role === 'builder' || userRole === 'builder') {
      setError('Builders cannot manage wishlist.');
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
    <div className="min-h-screen">
      <section
        id="section1"
        ref={(el) => (sectionRefs.current[0] = el)}
        className={`relative bg-cover bg-center text-white h-[80vh] flex items-center p-20 transition-all duration-1000 transform ${isVisible('section1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ backgroundImage: `ur[](https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Bg%20img/bglisting.jpg)` }}
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
        className={`max-w-6xl mx-auto py-12 px-4 transition-all duration-1000 transform ${isVisible('section2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
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
                  {property.image ? (
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-full transition-transform duration-300 group-hover:scale-105 rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-200');
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
                      <p className="text-sm">{property.type} • {property.status}</p>
                      <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Built by: {property.builder}
                      </p>
                      <div className="mt-1">
                        <Link
                          to={`/listings/${property.id}`}
                          className="inline-block text-rose-100 hover:underline"
                        >
                          View Details
                        </Link>
                      </div>
                      {userRole === 'customer' && property.isInWishlist !== undefined && (
                        <div className="mt-1">
                          <button
                            onClick={() => toggleWishlist(property.id)}
                            className="relative inline-block px-2 rounded-full font-medium text-white bg-green-600 z-10 overflow-hidden
                              before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-green-700
                              before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                          >
                            {property.isInWishlist ? 'Remove' : 'Add to Wishlist'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
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
            <span className="text-stone-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white
    disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
        <div className="flex justify-center mt-4">
          <Link
            to="/profile"
            className="inline-block text-stone-700 underline hover:font-semibold"
          >
            Wishlist
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Listings;