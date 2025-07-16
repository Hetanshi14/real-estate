import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { FaUser, FaBuilding, FaHome, FaTrash, FaEdit, FaMapMarkerAlt, FaMoneyBill } from 'react-icons/fa';

// Placeholder Base64 image (1x1 transparent pixel)
const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/8Vq6QAAAAABJRU5ErkJggg==';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistCriteria, setWishlistCriteria] = useState({
    location: '',
    price: '',
    area: '',
    property_type: '',
    status: '',
  });
  const [newProperty, setNewProperty] = useState({
    name: '', location: '', price: '', carpet_area: '', configuration: '', property_type: '',
    total_floors: '', total_units: '', status: '', rera_number: '', amenities: [],
    developer_name: '', developer_tagline: '', developer_experience: '', developer_projects_completed: '',
    developer_happy_families: '', nearby_landmarks: '', agent_name: '',
    agent_role: '', agent_phone: '', agent_email: '', agent_availability: '', agent_rating: '',
    agent_reviews: '', images: '', agents_image: '', builder_image: '', developer_awards: '', developer_certifications: '',
  });
  const [editProperty, setEditProperty] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const requiredFields = [
    'name', 'location', 'price', 'carpet_area', 'configuration', 'property_type',
    'total_floors', 'total_units', 'status', 'rera_number', 'amenities', 'developer_name', 'nearby_landmarks'
  ];

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (location.pathname !== '/login') {
          navigate('/login', { state: { from: '/profile' } });
        }
        return;
      }

      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, username, email, role, wishlist_criteria')
          .eq('id', session.user.id)
          .single();

        if (userError) throw new Error(`Failed to fetch user: ${userError.message}`);

        setUser(userData);
        setWishlistCriteria(userData.wishlist_criteria || {
          location: '',
          price: '',
          area: '',
          property_type: '',
          status: '',
        });

        if (userData.role === 'builder') {
          const { data: propertiesData, error: propertiesError } = await supabase
            .from('properties')
            .select('*')
            .eq('builder_id', userData.id);

          if (propertiesError) throw new Error(`Failed to fetch properties: ${propertiesError.message}`);
          setProperties(propertiesData || []);
        } else {
          const { data: wishlistData, error: wishlistError } = await supabase
            .from('wishlist')
            .select('property_id, properties (id, name, location, price, property_type, images, status, carpet_area)')
            .eq('user_id', userData.id);

          if (wishlistError) throw new Error(`Failed to fetch wishlist: ${wishlistError.message}`);
          setWishlist(wishlistData || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

      if (location.state?.from === '/login') {
        navigate('/profile', { replace: true });
      }
    };

    checkAuthAndFetch();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkAuthAndFetch();
      } else if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProperties([]);
        setWishlist([]);
        if (location.pathname !== '/login') {
          navigate('/login', { state: { from: '/profile' } });
        }
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [navigate, location.pathname, location.state]);

  const handlePropertyChange = (e) => {
    const { name, value } = e.target;
    if (editProperty) {
      setEditProperty((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewProperty((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenitiesChange = (e) => {
    const { value, checked } = e.target;
    if (editProperty) {
      setEditProperty((prev) => ({
        ...prev,
        amenities: checked ? [...prev.amenities, value] : prev.amenities.filter((a) => a !== value),
      }));
    } else {
      setNewProperty((prev) => ({
        ...prev,
        amenities: checked ? [...prev.amenities, value] : prev.amenities.filter((a) => a !== value),
      }));
    }
  };

  const handleImageUpload = async (e, field) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Please log in to upload images.');
      return;
    }

    try {
      let base64Strings = '';
      for (const file of files) {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;
        base64Strings += (base64Strings ? ',' : '') + base64;
      }

      if (editProperty) {
        setEditProperty((prev) => ({
          ...prev,
          [field]: prev[field] ? `${prev[field]},${base64Strings}` : base64Strings,
        }));
      } else {
        setNewProperty((prev) => ({
          ...prev,
          [field]: prev[field] ? `${prev[field]},${base64Strings}` : base64Strings,
        }));
      }
      setSuccessMessage(`Successfully uploaded ${files.length} image(s) to ${field}!`);
      setError(null);
    } catch (err) {
      console.error('Error in handleImageUpload:', err);
      setError(`Failed to process images: ${err.message}`);
    }
  };

  const handleAddProperty = useCallback(async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to add a property.');
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    try {
      const propertyData = {
        ...newProperty,
        price: parseFloat(newProperty.price) || 0,
        carpet_area: parseInt(newProperty.carpet_area) || 0,
        total_floors: parseInt(newProperty.total_floors) || 0,
        total_units: parseInt(newProperty.total_units) || 0,
        developer_experience: parseInt(newProperty.developer_experience) || null,
        developer_projects_completed: parseInt(newProperty.developer_projects_completed) || null,
        developer_happy_families: parseInt(newProperty.developer_happy_families) || null,
        agent_rating: parseFloat(newProperty.agent_rating) || null,
        agent_reviews: parseInt(newProperty.agent_reviews) || null,
        nearby_landmarks: newProperty.nearby_landmarks || '',
        builder_id: user.id,
        images: newProperty.images || '',
        agents_image: newProperty.agents_image || '',
        builder_image: newProperty.builder_image || '',
        developer_awards: newProperty.developer_awards || '',
        developer_certifications: newProperty.developer_certifications || '',
      };

      const missingFields = requiredFields.filter((field) => !propertyData[field] && propertyData[field] !== 0);
      if (missingFields.length > 0) throw new Error(`Missing required fields: ${missingFields.join(', ')}`);

      const { data, error } = await supabase.from('properties').insert([propertyData]).select('*');
      if (error) throw new Error(`Failed to add property: ${error.message}`);

      setProperties((prev) => [...prev, data[0]]);
      setNewProperty({
        name: '', location: '', price: '', carpet_area: '', configuration: '', property_type: '',
        total_floors: '', total_units: '', status: '', rera_number: '', amenities: [],
        developer_name: '', developer_tagline: '', developer_experience: '', developer_projects_completed: '',
        developer_happy_families: '', nearby_landmarks: '', agent_name: '',
        agent_role: '', agent_phone: '', agent_email: '', agent_availability: '', agent_rating: '',
        agent_reviews: '', images: '', agents_image: '', builder_image: '', developer_awards: '', developer_certifications: '',
      });
      setSuccessMessage('Property added successfully!');
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [user, newProperty, navigate]);

  const handleEditProperty = useCallback(async (e) => {
    e.preventDefault();
    if (!editProperty) return;

    try {
      const propertyData = {
        ...editProperty,
        price: parseFloat(editProperty.price) || 0,
        carpet_area: parseInt(editProperty.carpet_area) || 0,
        total_floors: parseInt(editProperty.total_floors) || 0,
        total_units: parseInt(editProperty.total_units) || 0,
        developer_experience: parseInt(editProperty.developer_experience) || null,
        developer_projects_completed: parseInt(editProperty.developer_projects_completed) || null,
        developer_happy_families: parseInt(editProperty.developer_happy_families) || null,
        agent_rating: parseFloat(editProperty.agent_rating) || null,
        agent_reviews: parseInt(editProperty.agent_reviews) || null,
        nearby_landmarks: editProperty.nearby_landmarks || '',
        builder_id: user.id,
        images: editProperty.images || '',
        agents_image: editProperty.agents_image || '',
        builder_image: editProperty.builder_image || '',
        developer_awards: editProperty.developer_awards || '',
        developer_certifications: editProperty.developer_certifications || '',
      };

      const missingFields = requiredFields.filter((field) => !propertyData[field] && propertyData[field] !== 0);
      if (missingFields.length > 0) throw new Error(`Missing required fields: ${missingFields.join(', ')}`);

      const { data, error } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', editProperty.id)
        .select('*');

      if (error) throw new Error(`Failed to update property: ${error.message}`);

      setProperties((prev) => prev.map((p) => (p.id === editProperty.id ? data[0] : p)));
      setEditProperty(null);
      setSuccessMessage('Property updated successfully!');
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [editProperty, user]);

  const handleDeleteProperty = async (id) => {
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw new Error(`Failed to delete property: ${error.message}`);
      setProperties(properties.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleWishlistCriteriaChange = (e) => {
    const { name, value } = e.target;
    setWishlistCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveWishlistCriteria = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ wishlist_criteria: wishlistCriteria })
        .eq('id', user.id);

      if (error) throw new Error(`Failed to save wishlist criteria: ${error.message}`);
      setError(null);
      alert('Wishlist criteria saved!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveWishlistItem = async (propertyId) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw new Error(`Failed to remove wishlist item: ${error.message}`);
      setWishlist(wishlist.filter((item) => item.property_id !== propertyId));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredWishlist = wishlist.filter((item) => {
    const criteria = wishlistCriteria;
    const property = item.properties;

    const locationMatch = !criteria.location || property.location.toLowerCase().includes(criteria.location.toLowerCase());
    const priceMatch = !criteria.price || (() => {
      const [min, max] = criteria.price.split('-').map((p) => (p === '+' ? Infinity : parseInt(p.replace(/[^0-9]/g, '')) || 0));
      const price = parseInt(property.price) || 0;
      return min <= price && (max === Infinity ? true : price <= max);
    })();
    const areaMatch = !criteria.area || (() => {
      const propArea = parseInt(property.carpet_area) || 0;
      const critArea = parseInt(criteria.area) || criteria.area.toLowerCase();
      return isNaN(propArea) || isNaN(parseInt(critArea)) ? property.carpet_area?.toLowerCase().includes(critArea) : propArea === parseInt(critArea);
    })();
    const typeMatch = !criteria.property_type || property.property_type === criteria.property_type;
    const statusMatch = !criteria.status || property.status === criteria.status;

    return locationMatch && priceMatch && areaMatch && typeMatch && statusMatch;
  });

  const handleEnterKey = (e, name) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentIndex = requiredFields.indexOf(name);
      if (currentIndex !== -1) {
        if (newProperty[name] && newProperty[name].trim() !== '') {
          const nextIndex = (currentIndex + 1) % requiredFields.length;
          const nextField = requiredFields[nextIndex];
          const nextInput = document.querySelector(`input[name="${nextField}"], select[name="${nextField}"]`);
          if (nextInput) nextInput.focus();
        }
      } else {
        const allFields = Object.keys(newProperty).filter((f) => f !== 'amenities' && f !== 'images' && f !== 'agents_image' && f !== 'builder_image' && f !== 'developer_awards' && f !== 'developer_certifications');
        const currentIndexOptional = allFields.indexOf(name);
        if (currentIndexOptional !== -1) {
          const nextIndex = (currentIndexOptional + 1) % allFields.length;
          const nextField = allFields[nextIndex];
          const nextInput = document.querySelector(`input[name="${nextField}"], select[name="${nextField}"]`);
          if (nextInput) nextInput.focus();
        }
      }
    }
  };

  // Render images safely, with fallback to placeholder
  const renderImages = (imageString, altPrefix) => {
    if (!imageString) {
      return (
        <div className="flex items-center justify-center w-20 h-20 bg-gray-200 text-stone-700 rounded">
          No Image
        </div>
      );
    }

    const images = imageString.split(',').filter((img) => img && img.startsWith('data:image/'));
    if (!images.length) {
      return (
        <div className="flex items-center justify-center w-20 h-20 bg-gray-200 text-stone-700 rounded">
          No Image
        </div>
      );
    }

    return images.map((img, index) => (
      <div key={index} className="relative">
        <img
          src={img}
          alt={`${altPrefix} ${index + 1}`}
          className="w-20 h-20 object-cover rounded"
          onError={(e) => {
            e.target.src = PLACEHOLDER_IMAGE;
            console.error('Image load failed:', img);
          }}
        />
        <span className="text-xs text-stone-600 absolute top-0 right-0 bg-white rounded-full p-1">
          {index + 1}
        </span>
      </div>
    ));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-stone-700">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <motion.section
        className="relative bg-cover bg-center text-white h-[80vh] flex items-center p-6 transition-all duration-1000 transform"
        style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 text-center w-full">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome, {user.role === 'builder' ? 'Builder' : 'User'} {user.username}!
          </h1>
          <p className="text-lg md:text-xl">
            {user.role === 'builder' ? 'Manage your properties here.' : 'Explore your wishlist and criteria.'}
          </p>
        </div>
      </motion.section>

      <motion.section
        className="py-12 px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">Profile</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 text-center">
              {successMessage}
              <button onClick={() => setSuccessMessage(null)} className="ml-2 text-green-700 hover:text-green-900">×</button>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-4">
              <FaUser className="text-stone-700 text-2xl mr-3" />
              <div>
                <h3 className="text-xl font-bold text-stone-700">{user.username}</h3>
                <p className="text-stone-600">{user.email}</p>
                <p className="text-stone-600">Role: {user.role}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/login', { state: { from: '/profile' } });
              }}
              className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
                before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
            >
              Log Out
            </button>
          </div>

          {user.role === 'builder' ? (
            <>
              <h3 className="text-2xl font-bold text-stone-700 mb-4">Add New Property</h3>
              <form onSubmit={handleAddProperty} className="bg-white rounded-lg shadow-md p-6 mb-8 grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Property Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newProperty.name}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'name')}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter property name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={newProperty.location}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'location')}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={newProperty.price}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'price')}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Carpet Area (sq.ft)</label>
                  <input
                    type="number"
                    name="carpet_area"
                    value={newProperty.carpet_area}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'carpet_area')}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter carpet area"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Configuration</label>
                  <input
                    type="text"
                    name="configuration"
                    value={newProperty.configuration}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'configuration')}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="e.g., 2 BHK"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Property Type</label>
                  <select
                    name="property_type"
                    value={newProperty.property_type}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'property_type')}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                  >
                    <option value="">Select type</option>
                    <option value="Flat">Flat</option>
                    <option value="Villa">Villa</option>
                    <option value="Plot">Plot</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Total Floors</label>
                  <input
                    type="number"
                    name="total_floors"
                    value={newProperty.total_floors}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'total_floors')}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter total floors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Total Units</label>
                  <input
                    type="number"
                    name="total_units"
                    value={newProperty.total_units}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'total_units')}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter total units"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={newProperty.status}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'status')}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                  >
                    <option value="">Select status</option>
                    <option value="Ready">Ready to Move</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">RERA Number</label>
                  <input
                    type="text"
                    name="rera_number"
                    value={newProperty.rera_number}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'rera_number')}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter RERA number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Amenities</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['24/7 Security', 'Lift', 'Parking', 'Swimming Pool', 'Gym', 'Clubhouse'].map((amenity) => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          value={amenity}
                          checked={newProperty.amenities.includes(amenity)}
                          onChange={handleAmenitiesChange}
                          className="mr-2"
                        />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Name</label>
                  <input
                    type="text"
                    name="developer_name"
                    value={newProperty.developer_name}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'developer_name')}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter developer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Tagline</label>
                  <input
                    type="text"
                    name="developer_tagline"
                    value={newProperty.developer_tagline}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'developer_tagline')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter developer tagline (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Experience</label>
                  <input
                    type="number"
                    name="developer_experience"
                    value={newProperty.developer_experience}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'developer_experience')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter developer experience (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Projects Completed</label>
                  <input
                    type="number"
                    name="developer_projects_completed"
                    value={newProperty.developer_projects_completed}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'developer_projects_completed')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter projects completed (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Happy Families</label>
                  <input
                    type="number"
                    name="developer_happy_families"
                    value={newProperty.developer_happy_families}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'developer_happy_families')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter happy families (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Nearby Landmarks</label>
                  <input
                    type="text"
                    name="nearby_landmarks"
                    value={newProperty.nearby_landmarks}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'nearby_landmarks')}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter landmarks as text (e.g., Park, School)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Name</label>
                  <input
                    type="text"
                    name="agent_name"
                    value={newProperty.agent_name}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'agent_name')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter agent name (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Role</label>
                  <input
                    type="text"
                    name="agent_role"
                    value={newProperty.agent_role}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'agent_role')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter agent role (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Phone</label>
                  <input
                    type="text"
                    name="agent_phone"
                    value={newProperty.agent_phone}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'agent_phone')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter agent phone (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Email</label>
                  <input
                    type="email"
                    name="agent_email"
                    value={newProperty.agent_email}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'agent_email')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter agent email (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Availability</label>
                  <input
                    type="text"
                    name="agent_availability"
                    value={newProperty.agent_availability}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'agent_availability')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter agent availability (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    name="agent_rating"
                    value={newProperty.agent_rating}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'agent_rating')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter agent rating (optional, 0-5)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Reviews</label>
                  <input
                    type="number"
                    name="agent_reviews"
                    value={newProperty.agent_reviews}
                    onChange={handlePropertyChange}
                    onKeyPress={(e) => handleEnterKey(e, 'agent_reviews')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    placeholder="Enter agent reviews (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Property Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'images')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg"
                  />
                  {newProperty.images && (
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {renderImages(newProperty.images, 'Property Image')}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'agents_image')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg"
                  />
                  {newProperty.agents_image && (
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {renderImages(newProperty.agents_image, 'Agent Image')}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Builder Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'builder_image')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg"
                  />
                  {newProperty.builder_image && (
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {renderImages(newProperty.builder_image, 'Builder Image')}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Awards</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'developer_awards')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg"
                  />
                  {newProperty.developer_awards && (
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {renderImages(newProperty.developer_awards, 'Developer Award')}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Certifications</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'developer_certifications')}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg"
                  />
                  {newProperty.developer_certifications && (
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {renderImages(newProperty.developer_certifications, 'Developer Certification')}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="relative md:col-span-2 h-9 w-40 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
                    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                >
                  Add Property
                </button>
              </form>

              {editProperty && (
                <form onSubmit={handleEditProperty} className="bg-white rounded-lg shadow-md p-6 mb-8 grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Property Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editProperty.name}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'name')}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter property name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editProperty.location}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'location')}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={editProperty.price}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'price')}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Carpet Area (sq.ft)</label>
                    <input
                      type="number"
                      name="carpet_area"
                      value={editProperty.carpet_area}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'carpet_area')}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter carpet area"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Configuration</label>
                    <input
                      type="text"
                      name="configuration"
                      value={editProperty.configuration}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'configuration')}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="e.g., 2 BHK"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Property Type</label>
                    <select
                      name="property_type"
                      value={editProperty.property_type}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'property_type')}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    >
                      <option value="">Select type</option>
                      <option value="Flat">Flat</option>
                      <option value="Villa">Villa</option>
                      <option value="Plot">Plot</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Total Floors</label>
                    <input
                      type="number"
                      name="total_floors"
                      value={editProperty.total_floors}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'total_floors')}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter total floors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Total Units</label>
                    <input
                      type="number"
                      name="total_units"
                      value={editProperty.total_units}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'total_units')}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter total units"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={editProperty.status}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'status')}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    >
                      <option value="">Select status</option>
                      <option value="Ready">Ready to Move</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="Upcoming">Upcoming</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">RERA Number</label>
                    <input
                      type="text"
                      name="rera_number"
                      value={editProperty.rera_number}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'rera_number')}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter RERA number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Amenities</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['24/7 Security', 'Lift', 'Parking', 'Swimming Pool', 'Gym', 'Clubhouse'].map((amenity) => (
                        <label key={amenity} className="flex items-center">
                          <input
                            type="checkbox"
                            value={amenity}
                            checked={editProperty.amenities.includes(amenity)}
                            onChange={handleAmenitiesChange}
                            className="mr-2"
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Name</label>
                    <input
                      type="text"
                      name="developer_name"
                      value={editProperty.developer_name}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'developer_name')}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter developer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Tagline</label>
                    <input
                      type="text"
                      name="developer_tagline"
                      value={editProperty.developer_tagline}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'developer_tagline')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter developer tagline (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Experience</label>
                    <input
                      type="number"
                      name="developer_experience"
                      value={editProperty.developer_experience}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'developer_experience')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter developer experience (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Projects Completed</label>
                    <input
                      type="number"
                      name="developer_projects_completed"
                      value={editProperty.developer_projects_completed}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'developer_projects_completed')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter projects completed (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Happy Families</label>
                    <input
                      type="number"
                      name="developer_happy_families"
                      value={editProperty.developer_happy_families}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'developer_happy_families')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter happy families (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Nearby Landmarks</label>
                    <input
                      type="text"
                      name="nearby_landmarks"
                      value={editProperty.nearby_landmarks}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'nearby_landmarks')}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter landmarks as text (e.g., Park, School)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Name</label>
                    <input
                      type="text"
                      name="agent_name"
                      value={editProperty.agent_name}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'agent_name')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter agent name (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Role</label>
                    <input
                      type="text"
                      name="agent_role"
                      value={editProperty.agent_role}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'agent_role')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter agent role (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Phone</label>
                    <input
                      type="text"
                      name="agent_phone"
                      value={editProperty.agent_phone}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'agent_phone')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter agent phone (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Email</label>
                    <input
                      type="email"
                      name="agent_email"
                      value={editProperty.agent_email}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'agent_email')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter agent email (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Availability</label>
                    <input
                      type="text"
                      name="agent_availability"
                      value={editProperty.agent_availability}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'agent_availability')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter agent availability (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      name="agent_rating"
                      value={editProperty.agent_rating}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'agent_rating')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter agent rating (optional, 0-5)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Reviews</label>
                    <input
                      type="number"
                      name="agent_reviews"
                      value={editProperty.agent_reviews}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'agent_reviews')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter agent reviews (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Property Images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'images')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg"
                    />
                    {editProperty.images && (
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {renderImages(editProperty.images, 'Property Image')}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Agent Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'agents_image')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg"
                    />
                    {editProperty.agents_image && (
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {renderImages(editProperty.agents_image, 'Agent Image')}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Builder Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'builder_image')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg"
                    />
                    {editProperty.builder_image && (
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {renderImages(editProperty.builder_image, 'Builder Image')}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Awards</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'developer_awards')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg"
                    />
                    {editProperty.developer_awards && (
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {renderImages(editProperty.developer_awards, 'Developer Award')}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Certifications</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'developer_certifications')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg"
                    />
                    {editProperty.developer_certifications && (
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {renderImages(editProperty.developer_certifications, 'Developer Certification')}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="relative md:col-span-2 h-9 w-50 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
                      before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                      before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditProperty(null)}
                    className="relative md:col-span-2 mt-2 h-9 w-50 rounded-lg font-semibold text-white bg-red-500 z-10 overflow-hidden
                      before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-red-600
                      before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                  >
                    Cancel
                  </button>
                </form>
              )}

              <h3 id="properties-section" className="text-2xl font-bold text-stone-700 mb-4">Your Properties</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
                {properties.length > 0 ? (
                  properties.map((property) => (
                    <div key={property.id} className="rounded shadow hover:shadow-lg transition text-white relative group h-[300px] w-full overflow-hidden">
                      <div className="relative h-full w-full overflow-hidden rounded">
                        {property.images && property.images.split(',').length > 0 && property.images.split(',')[0].startsWith('data:image/') ? (
                          <img
                            src={property.images.split(',')[0]}
                            alt={property.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded"
                            onError={(e) => {
                              e.target.src = PLACEHOLDER_IMAGE;
                              e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-200');
                              console.error('Image load failed:', property.images.split(',')[0]);
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
                            <p className="text-sm">₹{property.price.toLocaleString()}</p>
                            <p className="text-sm">{property.property_type} • {property.status}</p>
                            {property.builder_image && (
                              <div className="mt-2 w-12 h-12">
                                <img
                                  src={property.builder_image.split(',')[0]}
                                  alt={`${property.developer_name} logo`}
                                  className="w-full h-full object-cover rounded-full"
                                  onError={(e) => {
                                    e.target.src = PLACEHOLDER_IMAGE;
                                    console.error('Builder image load failed:', property.builder_image);
                                  }}
                                />
                              </div>
                            )}
                            {property.developer_awards && (
                              <div className="mt-2 w-12 h-12">
                                <img
                                  src={property.developer_awards.split(',')[0]}
                                  alt={`${property.developer_name} award`}
                                  className="w-full h-full object-cover rounded"
                                  onError={(e) => {
                                    e.target.src = PLACEHOLDER_IMAGE;
                                    console.error('Award image load failed:', property.developer_awards);
                                  }}
                                />
                              </div>
                            )}
                            {property.developer_certifications && (
                              <div className="mt-2 w-12 h-12">
                                <img
                                  src={property.developer_certifications.split(',')[0]}
                                  alt={`${property.developer_name} certification`}
                                  className="w-full h-full object-cover rounded"
                                  onError={(e) => {
                                    e.target.src = PLACEHOLDER_IMAGE;
                                    console.error('Certification image load failed:', property.developer_certifications);
                                  }}
                                />
                              </div>
                            )}
                            <div className="mt-1">
                              <button
                                onClick={() => setEditProperty({ ...property })}
                                className="relative inline-block px-2 py-1 rounded-full font-medium text-white bg-stone-700 z-10 overflow-hidden
                                  before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                                  before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                              >
                                <FaEdit className="inline mr-2" /> Edit
                              </button>
                            </div>
                            <div className="mt-1">
                              <button
                                onClick={() => handleDeleteProperty(property.id)}
                                className="relative inline-block px-2 py-1 rounded-full font-medium text-white bg-red-500 z-10 overflow-hidden
                                  before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-red-600
                                  before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                              >
                                <FaTrash className="inline mr-2" /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-stone-600 text-lg col-span-full">
                    No properties listed yet.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-stone-700 mb-4">Your Wishlist Criteria</h3>
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
                      <FaMapMarkerAlt className="mr-2" /> Preferred Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={wishlistCriteria.location}
                      onChange={handleWishlistCriteriaChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter preferred location"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
                      <FaMoneyBill className="mr-2" /> Price Range
                    </label>
                    <select
                      name="price"
                      value={wishlistCriteria.price}
                      onChange={handleWishlistCriteriaChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    >
                      <option value="">Select price range</option>
                      <option value="0-5000000">0-₹50L</option>
                      <option value="5000000-7000000">₹50L-₹70L</option>
                      <option value="7000000-10000000">₹70L-₹1cr</option>
                      <option value="10000000-15000000">₹1cr-₹1.5cr</option>
                      <option value="15000000+">₹1.5cr+</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
                      <FaMapMarkerAlt className="mr-2" /> Area
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={wishlistCriteria.area}
                      onChange={handleWishlistCriteriaChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter preferred area"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
                      <FaHome className="mr-2" /> Property Type
                    </label>
                    <select
                      name="property_type"
                      value={wishlistCriteria.property_type}
                      onChange={handleWishlistCriteriaChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    >
                      <option value="">Select type</option>
                      <option value="Flat">Flat</option>
                      <option value="Villa">Villa</option>
                      <option value="Plot">Plot</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
                      <FaBuilding className="mr-2" /> Status
                    </label>
                    <select
                      name="status"
                      value={wishlistCriteria.status}
                      onChange={handleWishlistCriteriaChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    >
                      <option value="">Select status</option>
                      <option value="Ready">Ready to Move</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="Upcoming">Upcoming</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleSaveWishlistCriteria}
                  className="relative mt-4 py-3 px-6 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
                    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                >
                  Save Criteria
                </button>
              </div>

              <h3 className="text-2xl font-bold text-stone-700 mb-4">Your Wishlist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
                {filteredWishlist.length > 0 ? (
                  filteredWishlist.map((item) => (
                    <div key={item.property_id} className="rounded shadow hover:shadow-lg transition text-white relative group h-[300px] w-full overflow-hidden">
                      <div className="relative h-full w-full overflow-hidden rounded">
                        {item.properties.images && item.properties.images.split(',').length > 0 && item.properties.images.split(',')[0].startsWith('data:image/') ? (
                          <img
                            src={item.properties.images.split(',')[0]}
                            alt={item.properties.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded"
                            onError={(e) => {
                              e.target.src = PLACEHOLDER_IMAGE;
                              e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-200');
                              console.error('Image load failed:', item.properties.images.split(',')[0]);
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
                            <h3 className="text-lg font-semibold">{item.properties.name}</h3>
                            <p className="text-sm">{item.properties.location}</p>
                            <p className="text-sm">₹{item.properties.price.toLocaleString()}</p>
                            <p className="text-sm">{item.properties.property_type} • {item.properties.status}</p>
                            <div className="mt-1">
                              <button
                                onClick={() => navigate(`/listings/${item.property_id}`)}
                                className="inline-block text-rose-100 hover:underline"
                              >
                                View Details
                              </button>
                            </div>
                            <div className="mt-1">
                              <button
                                onClick={() => handleRemoveWishlistItem(item.property_id)}
                                className="relative inline-block px-2 py-1 rounded-full font-medium text-white bg-stone-700 z-10 overflow-hidden
                                  before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                                  before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                              >
                                <FaTrash className="inline mr-2" /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-stone-600 text-lg col-span-full">
                    No properties match your wishlist criteria.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default Profile;