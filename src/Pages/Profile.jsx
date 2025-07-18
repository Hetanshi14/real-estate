import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { FaUser, FaBuilding, FaHome, FaTrash, FaEdit, FaMapMarkerAlt, FaMoneyBill, FaPlus } from 'react-icons/fa';

// Fallback placeholder image URL
const PLACEHOLDER_IMAGE_URL = 'https://via.placeholder.com/300?text=No+Image';

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
    name: '',
    location: '',
    price: '',
    carpet_area: '',
    configuration: '',
    property_type: '',
    total_floors: '',
    total_units: '',
    status: '',
    rera_number: '',
    amenities: [],
    developer_name: '',
    developer_tagline: '',
    developer_experience: '',
    developer_projects_completed: '',
    developer_happy_families: '',
    nearby_landmarks: '',
    agent_name: '',
    agent_role: '',
    agent_phone: '',
    agent_email: '',
    agent_availability: '',
    agent_rating: '',
    agent_reviews: '',
    images: '', // Changed to string to store comma-separated URLs
    agents_image: '',
    developer_image: '',
    developer_awards: '',
    developer_certifications: '',
  });
  const [editProperty, setEditProperty] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false); // Toggle state for form visibility
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const requiredFields = [
    'name',
    'location',
    'price',
    'carpet_area',
    'configuration',
    'property_type',
    'total_floors',
    'total_units',
    'status',
    'rera_number',
    'amenities',
    'developer_name',
    'nearby_landmarks',
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
        setWishlistCriteria(
          userData.wishlist_criteria || {
            location: '',
            price: '',
            area: '',
            property_type: '',
            status: '',
          }
        );

        if (userData.role === 'developer') {
          const { data: propertiesData, error: propertiesError } = await supabase
            .from('properties')
            .select('*')
            .eq('developer_id', userData.id);

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
  }, [navigate, location.pathname]);

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
    const files = e.target.files;
    if (!files || files.length === 0) {
      setError(`No files selected for ${field}.`);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Please log in to upload images.');
      return;
    }

    // Validate files
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError(`Only image files are allowed for ${field}.`);
        return;
      }
      if (file.size > maxSize) {
        setError(`File size exceeds 5MB limit for ${field}.`);
        return;
      }
    }

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${field}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw new Error(`Failed to upload ${field}: ${uploadError.message}`);

        const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
        if (!urlData.publicUrl) throw new Error(`Failed to retrieve public URL for ${field}`);

        return urlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const updatedImages = uploadedUrls.join(',');

      if (editProperty) {
        setEditProperty((prev) => ({
          ...prev,
          [field]: field === 'images' ? (prev[field] ? `${prev[field]},${updatedImages}` : updatedImages) : updatedImages,
        }));
      } else {
        setNewProperty((prev) => ({
          ...prev,
          [field]: field === 'images' ? (prev[field] ? `${prev[field]},${updatedImages}` : updatedImages) : updatedImages,
        }));
      }
      setSuccessMessage(`Successfully uploaded ${field} images!`);
      setError(null);
    } catch (err) {
      console.error('Error in handleImageUpload:', err);
      setError(`Failed to upload ${field}: ${err.message}. Please try again.`);
    }
  };

  const handleAddProperty = useCallback(
    async (e) => {
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
          developer_id: user.id,
          images: newProperty.images || '', // Ensure images is a string
          agents_image: newProperty.agents_image || '',
          developer_image: newProperty.developer_image || '',
        };

        const missingFields = requiredFields.filter(
          (field) => !propertyData[field] && propertyData[field] !== 0
        );
        if (missingFields.length > 0) throw new Error(`Missing required fields: ${missingFields.join(', ')}`);

        const { data, error } = await supabase.from('properties').insert([propertyData]).select('*');
        if (error) throw new Error(`Failed to add property: ${error.message}`);

        setProperties((prev) => [...prev, data[0]]);
        setNewProperty({
          name: '',
          location: '',
          price: '',
          carpet_area: '',
          configuration: '',
          property_type: '',
          total_floors: '',
          total_units: '',
          status: '',
          rera_number: '',
          amenities: [],
          developer_name: '',
          developer_tagline: '',
          developer_experience: '',
          developer_projects_completed: '',
          developer_happy_families: '',
          nearby_landmarks: '',
          agent_name: '',
          agent_role: '',
          agent_phone: '',
          agent_email: '',
          agent_availability: '',
          agent_rating: '',
          agent_reviews: '',
          images: '', // Reset to empty string
          agents_image: '',
          developer_image: '',
          developer_awards: '',
          developer_certifications: '',
        });
        setShowAddForm(false); // Hide form after successful submission
        setSuccessMessage('Property added successfully!');
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    },
    [user, newProperty, navigate]
  );

  const handleEditProperty = useCallback(
    async (e) => {
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
          developer_id: user.id,
          images: editProperty.images || '', // Ensure images is a string
          agents_image: editProperty.agents_image || '',
          developer_image: editProperty.developer_image || '',
        };

        const missingFields = requiredFields.filter(
          (field) => !propertyData[field] && propertyData[field] !== 0
        );
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
    },
    [editProperty, user]
  );

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
      setSuccessMessage('Wishlist criteria saved successfully!');
      setError(null);
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

    const locationMatch =
      !criteria.location || property.location.toLowerCase().includes(criteria.location.toLowerCase());
    const priceMatch =
      !criteria.price ||
      (() => {
        const [min, max] = criteria.price
          .split('-')
          .map((p) => (p === '+' ? Infinity : parseInt(p.replace(/[^0-9]/g, '')) || 0));
        const price = parseInt(property.price) || 0;
        return min <= price && (max === Infinity ? true : price <= max);
      })();
    const areaMatch =
      !criteria.area ||
      (() => {
        const propArea = parseInt(property.carpet_area) || 0;
        const critArea = parseInt(criteria.area) || criteria.area.toLowerCase();
        return isNaN(propArea) || isNaN(parseInt(critArea))
          ? property.carpet_area?.toLowerCase().includes(critArea)
          : propArea === parseInt(critArea);
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
          const nextInput = document.querySelector(
            `input[name="${nextField}"], select[name="${nextField}"]`
          );
          if (nextInput) nextInput.focus();
        }
      } else {
        const allFields = Object.keys(newProperty).filter(
          (f) => f !== 'amenities' && f !== 'images' && f !== 'agents_image' && f !== 'developer_image'
        );
        const currentIndexOptional = allFields.indexOf(name);
        if (currentIndexOptional !== -1) {
          const nextIndex = (currentIndexOptional + 1) % allFields.length;
          const nextField = allFields[nextIndex];
          const nextInput = document.querySelector(
            `input[name="${nextField}"], select[name="${nextField}"]`
          );
          if (nextInput) nextInput.focus();
        }
      }
    }
  };

  // Render images safely, with fallback to placeholder URL
  const renderImages = (imageUrl, altPrefix) => {
    if (!imageUrl || imageUrl.trim() === '') {
      console.log(`No ${altPrefix.toLowerCase()} image available, using fallback`);
      return (
        <div className="flex items-center justify-center w-20 h-20 bg-gray-200 text-stone-700 rounded">
          No Image
        </div>
      );
    }

    const imageUrls = imageUrl.split(',').filter((url) => url.trim() !== '');
    return (
      <div className="flex space-x-2">
        {imageUrls.map((url, index) => (
          <div key={index} className="relative">
            <img
              src={url.trim()}
              alt={`${altPrefix} ${index + 1}`}
              className="w-20 h-20 object-cover rounded"
              onError={(e) => {
                console.error(`Failed to load ${altPrefix.toLowerCase()} image:`, url);
                e.target.src = PLACEHOLDER_IMAGE_URL;
                setError(`Failed to load ${altPrefix.toLowerCase()} image. Using placeholder.`);
              }}
            />
            <span className="text-xs text-stone-600 absolute top-0 right-0 bg-white rounded-full p-1">
              {index + 1}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-stone-700">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <motion.section
        className="relative bg-cover bg-center text-white h-[80vh] flex items-center p-6 transition-all duration-1000 transform"
        style={{ backgroundImage: `url(${PLACEHOLDER_IMAGE_URL})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 text-center w-full">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome, {user.role === 'developer' ? 'Developer' : 'User'} {user.username}!
          </h1>
          <p className="text-lg md:text-xl">
            {user.role === 'developer' ? 'Manage your properties here.' : 'Explore your wishlist and criteria.'}
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

          {user.role === 'developer' && (
            <>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="relative mb-6 inline-block px-6 py-2 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
                  before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                  before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
              >
                <FaPlus className="inline mr-2" /> {showAddForm ? 'Property' : 'Add New Property'}
              </button>

              {showAddForm && (
                <form
                  onSubmit={handleAddProperty}
                  className="bg-white rounded-lg shadow-md p-6 mb-8 grid md:grid-cols-2 gap-6"
                >
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
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Projects Completed
                    </label>
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
                      accept="image/*"
                      multiple // Allow multiple file selection
                      onChange={(e) => handleImageUpload(e, 'images')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg"
                    />
                    {newProperty.images && (
                      <div className="mt-2">{renderImages(newProperty.images, 'Property Image')}</div>
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
                      <div className="mt-2">{renderImages(newProperty.agents_image, 'Agent Image')}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'developer_image')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg"
                    />
                    {newProperty.developer_image && (
                      <div className="mt-2">{renderImages(newProperty.developer_image, 'Developer Image')}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Awards</label>
                    <input
                      type="text"
                      name="developer_awards"
                      value={newProperty.developer_awards}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'developer_awards')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter developer awards (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Certifications</label>
                    <input
                      type="text"
                      name="developer_certifications"
                      value={newProperty.developer_certifications}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'developer_certifications')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter developer certifications (optional)"
                    />
                  </div>
                  <button
                    type="submit"
                    className="relative md:col-span-2 h-9 w-40 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
                      before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                      before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                  >
                    Add Property
                  </button>
                  {error && (
                    <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center md:col-span-2">
                      {error}
                    </div>
                  )}
                  {successMessage && (
                    <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center md:col-span-2">
                      {successMessage}
                      <button
                        onClick={() => setSuccessMessage(null)}
                        className="ml-2 text-green-700 hover:text-green-900"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </form>
              )}

              {editProperty && (
                <form
                  onSubmit={handleEditProperty}
                  className="bg-white rounded-lg shadow-md p-6 mb-8 grid md:grid-cols-2 gap-6"
                >
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
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Projects Completed
                    </label>
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
                      accept="image/*"
                      multiple // Allow multiple file selection
                      onChange={(e) => handleImageUpload(e, 'images')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg"
                    />
                    {editProperty.images && (
                      <div className="mt-2">{renderImages(editProperty.images, 'Property Image')}</div>
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
                      <div className="mt-2">{renderImages(editProperty.agents_image, 'Agent Image')}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'developer_image')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg"
                    />
                    {editProperty.developer_image && (
                      <div className="mt-2">{renderImages(editProperty.developer_image, 'Developer Image')}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Awards</label>
                    <input
                      type="text"
                      name="developer_awards"
                      value={editProperty.developer_awards}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'developer_awards')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter developer awards (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Developer Certifications</label>
                    <input
                      type="text"
                      name="developer_certifications"
                      value={editProperty.developer_certifications}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, 'developer_certifications')}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="Enter developer certifications (optional)"
                    />
                  </div>
                  <button
                    type="submit"
                    className="relative md:col-span-2 h-9 w-40 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
                      before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                      before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditProperty(null)}
                    className="relative md:col-span-2 mt-2 h-9 w-40 rounded-lg font-semibold text-white bg-red-500 z-10 overflow-hidden
                      before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-red-600
                      before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                  >
                    Cancel
                  </button>
                  {error && (
                    <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center md:col-span-2">
                      {error}
                    </div>
                  )}
                  {successMessage && (
                    <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center md:col-span-2">
                      {successMessage}
                      <button
                        onClick={() => setSuccessMessage(null)}
                        className="ml-2 text-green-700 hover:text-green-900"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </form>
              )}

              <h3 id="properties-section" className="text-2xl font-bold text-stone-700 mb-4">
                Your Properties
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
                {properties.length > 0 ? (
                  properties.map((property) => (
                    <div
                      key={property.id}
                      className="rounded shadow hover:shadow-lg transition text-white relative group h-[300px] w-full overflow-hidden"
                    >
                      <div className="relative h-full w-full overflow-hidden rounded">
                        <img
                          src={property.images ? property.images.split(',')[0] || PLACEHOLDER_IMAGE_URL : PLACEHOLDER_IMAGE_URL}
                          alt={property.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded"
                          onError={(e) => {
                            console.error('Image load failed:', property.images);
                            e.target.src = PLACEHOLDER_IMAGE_URL;
                            e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-200');
                            setError(`Failed to load image for ${property.name}. Using placeholder.`);
                          }}
                        />
                        <div className="absolute inset-0 bg-black opacity-40 md:opacity-0 md:group-hover:opacity-40 transition-opacity duration-300 z-0"></div>
                        <div className="absolute inset-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                          <div className="absolute bottom-4 left-4 text-left">
                            <h3 className="text-lg font-semibold">{property.name}</h3>
                            <p className="text-sm">{property.location}</p>
                            <p className="text-sm">₹{property.price.toLocaleString()}</p>
                            <p className="text-sm">
                              {property.property_type} • {property.status}
                            </p>
                            {property.developer_image && (
                              <div className="mt-2 w-12 h-12">
                                <img
                                  src={property.developer_image}
                                  alt={`${property.developer_name} logo`}
                                  className="w-full h-full object-cover rounded-full"
                                  onError={(e) => {
                                    console.error('Developer image load failed:', property.developer_image);
                                    e.target.src = PLACEHOLDER_IMAGE_URL;
                                  }}
                                />
                              </div>
                            )}
                            <p className="text-sm mt-2">{property.developer_awards}</p>
                            <p className="text-sm">{property.developer_certifications}</p>
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
                              {error && (
                                <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                                  {error}
                                </div>
                              )}
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
          )}
          {user.role !== 'developer' && (
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
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
                      <FaMoneyBill className="mr-2" /> Price Range
                    </label>
                    <input
                      type="text"
                      name="price"
                      value={wishlistCriteria.price}
                      onChange={handleWishlistCriteriaChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="e.g., 50L-1Cr or 1Cr+"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
                      <FaHome className="mr-2" /> Area (sq.ft)
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={wishlistCriteria.area}
                      onChange={handleWishlistCriteriaChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                      placeholder="e.g., 1000 or 1500+"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
                      <FaBuilding className="mr-2" /> Property Type
                    </label>
                    <select
                      name="property_type"
                      value={wishlistCriteria.property_type}
                      onChange={handleWishlistCriteriaChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
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
                      value={wishlistCriteria.status}
                      onChange={handleWishlistCriteriaChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500"
                    >
                      <option value="">Any</option>
                      <option value="Ready">Ready to Move</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="Upcoming">Upcoming</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleSaveWishlistCriteria}
                  className="mt-6 relative inline-block px-6 py-2 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
                    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                >
                  Save Criteria
                </button>
                {error && (
                  <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center">
                    {successMessage}
                    <button
                      onClick={() => setSuccessMessage(null)}
                      className="ml-2 text-green-700 hover:text-green-900"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold text-stone-700 mb-4">Your Wishlist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredWishlist.length > 0 ? (
                  filteredWishlist.map((item) => {
                    const property = item.properties;
                    return (
                      <div
                        key={property.id}
                        className="rounded shadow hover:shadow-lg transition text-white relative group h-[300px] w-full overflow-hidden"
                      >
                        <div className="relative h-full w-full overflow-hidden rounded">
                          <img
                            src={property.images ? property.images.split(',')[0] || PLACEHOLDER_IMAGE_URL : PLACEHOLDER_IMAGE_URL}
                            alt={property.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded"
                            onError={(e) => {
                              console.error('Image load failed:', property.images);
                              e.target.src = PLACEHOLDER_IMAGE_URL;
                              e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-gray-200');
                              setError(`Failed to load image for ${property.name}. Using placeholder.`);
                            }}
                          />
                          <div className="absolute inset-0 bg-black opacity-40 md:opacity-0 md:group-hover:opacity-40 transition-opacity duration-300 z-0"></div>
                          <div className="absolute inset-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                            <div className="absolute bottom-4 left-4 text-left">
                              <h3 className="text-lg font-semibold">{property.name}</h3>
                              <p className="text-sm">{property.location}</p>
                              <p className="text-sm">₹{property.price.toLocaleString()}</p>
                              <p className="text-sm">
                                {property.property_type} • {property.status}
                              </p>
                              <div className="mt-1">
                                <button
                                  onClick={() => handleRemoveWishlistItem(property.id)}
                                  className="relative inline-block px-2 py-1 rounded-full font-medium text-white bg-red-500 z-10 overflow-hidden
                                    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-red-600
                                    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                                >
                                  <FaTrash className="inline mr-2" /> Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-stone-600 text-lg col-span-full">
                    No properties match your criteria or wishlist is empty.
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