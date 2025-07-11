import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import bgabout from '../assets/bgabout.jpg?default=https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

const AddProperty = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    property_type: '',
    images: [''],
    builder_id: '',
    price: '',
    location: '',
    status: '',
    configuration: '',
    carpet_area: '',
    total_floors: '',
    total_units: '',
    rera_number: '',
    amenities: [''],
    developer_name: '',
    developer_tagline: '',
    developer_experience: '',
    developer_projects_completed: '',
    developer_happy_families: '',
    nearby_landmarks: [{ name: '', distance: '' }],
    agent_name: '',
    agent_role: '',
    agent_phone: '',
    agent_email: '',
    agent_availability: '',
    agent_rating: '',
    agent_reviews: '',
    agents_image: [''],
  });
  const [builders, setBuilders] = useState([]);
  const [errors, setErrors] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    console.log('AddProperty component mounted');
    document.title = 'Add Property - Zivaas Properties';

    const fetchBuilders = async () => {
      try {
        setLoading(true);
        console.log('Attempting to fetch builders from Supabase');
        const { data, error } = await supabase
          .from('builders')
          .select('id, name')
          .order('name', { ascending: true });
        console.log('Builders fetch response:', { data, error });
        if (error) {
          console.error('Builders fetch error:', error.message);
          throw new Error('Failed to fetch builders: ' + error.message);
        }
        setBuilders(data || []);
        setFetchError(null);
      } catch (err) {
        console.error('Error fetching builders:', err.message);
        setFetchError(err.message);
        setSubmissionStatus({ type: 'error', message: 'Failed to load builders: ' + err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchBuilders();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('Section visible');
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      console.log('Observing sectionRef');
      observer.observe(sectionRef.current);
    }

    return () => {
      console.log('AddProperty component unmounted');
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleArrayChange = (e, index, field) => {
    const newArray = [...formData[field]];
    newArray[index] = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: newArray }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleLandmarkChange = (e, index, key) => {
    const newLandmarks = [...formData.nearby_landmarks];
    newLandmarks[index] = { ...newLandmarks[index], [key]: e.target.value };
    setFormData((prev) => ({ ...prev, nearby_landmarks: newLandmarks }));
    setErrors((prev) => ({ ...prev, nearby_landmarks: '' }));
  };

  const addLandmark = () => {
    setFormData((prev) => ({
      ...prev,
      nearby_landmarks: [...prev.nearby_landmarks, { name: '', distance: '' }],
    }));
  };

  const removeLandmark = (index) => {
    setFormData((prev) => ({
      ...prev,
      nearby_landmarks: prev.nearby_landmarks.filter((_, i) => i !== index),
    }));
  };

  const addAmenity = () => {
    setFormData((prev) => ({
      ...prev,
      amenities: [...prev.amenities, ''],
    }));
  };

  const removeAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Property name is required';
    if (!formData.property_type) newErrors.property_type = 'Property type is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.price || isNaN(formData.price) || formData.price < 0)
      newErrors.price = 'Price must be a non-negative number';
    if (!formData.carpet_area || isNaN(formData.carpet_area) || formData.carpet_area < 0)
      newErrors.carpet_area = 'Carpet area must be a non-negative number';
    if (!formData.configuration.trim()) newErrors.configuration = 'Configuration is required';
    if (!formData.total_floors || isNaN(formData.total_floors) || formData.total_floors < 0)
      newErrors.total_floors = 'Total floors must be a non-negative number';
    if (!formData.total_units || isNaN(formData.total_units) || formData.total_units < 0)
      newErrors.total_units = 'Total units must be a non-negative number';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.rera_number.trim()) newErrors.rera_number = 'RERA number is required';
    if (!formData.amenities.length || formData.amenities.every((a) => !a.trim()))
      newErrors.amenities = 'At least one amenity is required';
    if (!formData.developer_name.trim()) newErrors.developer_name = 'Developer name is required';
    if (!formData.nearby_landmarks.length || formData.nearby_landmarks.every((l) => !l.name.trim() || !l.distance.trim()))
      newErrors.nearby_landmarks = 'At least one landmark with name and distance is required';
    if (!formData.agent_name.trim()) newErrors.agent_name = 'Agent name is required';
    if (!formData.agent_role.trim()) newErrors.agent_role = 'Agent role is required';
    if (!formData.agent_phone.trim()) newErrors.agent_phone = 'Agent phone is required';
    if (!formData.agent_email.trim()) newErrors.agent_email = 'Agent email is required';
    if (formData.agent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.agent_email))
      newErrors.agent_email = 'Invalid email format';
    if (formData.images[0] && !/^https?:\/\/.*\.(?:png|jpg|jpeg|gif)$/.test(formData.images[0]))
      newErrors.images = 'Invalid image URL (png, jpg, jpeg, gif)';
    if (formData.agents_image[0] && !/^https?:\/\/.*\.(?:png|jpg|jpeg|gif)$/.test(formData.agents_image[0]))
      newErrors.agents_image = 'Invalid agent image URL (png, jpg, jpeg, gif)';
    if (formData.developer_experience && (isNaN(formData.developer_experience) || formData.developer_experience < 0))
      newErrors.developer_experience = 'Experience must be a non-negative number';
    if (formData.developer_projects_completed && (isNaN(formData.developer_projects_completed) || formData.developer_projects_completed < 0))
      newErrors.developer_projects_completed = 'Projects completed must be a non-negative number';
    if (formData.developer_happy_families && (isNaN(formData.developer_happy_families) || formData.developer_happy_families < 0))
      newErrors.developer_happy_families = 'Happy families must be a non-negative number';
    if (formData.agent_rating && (isNaN(formData.agent_rating) || formData.agent_rating < 0 || formData.agent_rating > 5))
      newErrors.agent_rating = 'Rating must be between 0 and 5';
    if (formData.agent_reviews && (isNaN(formData.agent_reviews) || formData.agent_reviews < 0))
      newErrors.agent_reviews = 'Reviews must be a non-negative number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmissionStatus(null);
      const propertyData = {
        name: formData.name.trim(),
        property_type: formData.property_type,
        images: formData.images[0]?.trim() ? [formData.images[0].trim()] : [],
        builder_id: formData.builder_id || null,
        price: parseFloat(formData.price),
        location: formData.location.trim(),
        status: formData.status,
        configuration: formData.configuration.trim(),
        carpet_area: parseInt(formData.carpet_area, 10),
        total_floors: parseInt(formData.total_floors, 10),
        total_units: parseInt(formData.total_units, 10),
        rera_number: formData.rera_number.trim(),
        amenities: formData.amenities.filter((a) => a.trim()).map((a) => a.trim()),
        developer_name: formData.developer_name.trim(),
        developer_tagline: formData.developer_tagline?.trim() || null,
        developer_experience: formData.developer_experience ? parseInt(formData.developer_experience, 10) : null,
        developer_projects_completed: formData.developer_projects_completed
          ? parseInt(formData.developer_projects_completed, 10)
          : null,
        developer_happy_families: formData.developer_happy_families
          ? parseInt(formData.developer_happy_families, 10)
          : null,
        nearby_landmarks: formData.nearby_landmarks.filter((l) => l.name.trim() && l.distance.trim()),
        agent_name: formData.agent_name.trim(),
        agent_role: formData.agent_role.trim(),
        agent_phone: formData.agent_phone.trim(),
        agent_email: formData.agent_email.trim(),
        agent_availability: formData.agent_availability?.trim() || null,
        agent_rating: formData.agent_rating ? parseFloat(formData.agent_rating) : null,
        agent_reviews: formData.agent_reviews ? parseInt(formData.agent_reviews, 10) : null,
        agents_image: formData.agents_image[0]?.trim() ? [formData.agents_image[0].trim()] : [],
      };
      console.log('Submitting property:', propertyData);

      const { data, error } = await supabase.from('properties').insert([propertyData]).select();

      if (error) {
        console.error('Submission error:', error.message);
        setSubmissionStatus({ type: 'error', message: 'Failed to add property: ' + error.message });
        return;
      }

      console.log('Property added successfully:', data);
      setSubmissionStatus({
        type: 'success',
        message: (
          <>
            Property added successfully! View it on the{' '}
            <Link to="/listings" className="underline text-green-600 hover:text-green-800">
              Listings
            </Link>{' '}
            page.
          </>
        ),
      });
      setFormData({
        name: '',
        property_type: '',
        images: [''],
        builder_id: '',
        price: '',
        location: '',
        status: '',
        configuration: '',
        carpet_area: '',
        total_floors: '',
        total_units: '',
        rera_number: '',
        amenities: [''],
        developer_name: '',
        developer_tagline: '',
        developer_experience: '',
        developer_projects_completed: '',
        developer_happy_families: '',
        nearby_landmarks: [{ name: '', distance: '' }],
        agent_name: '',
        agent_role: '',
        agent_phone: '',
        agent_email: '',
        agent_availability: '',
        agent_rating: '',
        agent_reviews: '',
        agents_image: [''],
      });
      setErrors({});
      setTimeout(() => navigate(`/listings?t=${Date.now()}`), 3000);
    } catch (err) {
      console.error('Unexpected submission error:', err.message);
      setSubmissionStatus({ type: 'error', message: 'An unexpected error occurred: ' + err.message });
    }
  };

  if (fetchError && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center text-stone-800">
          <h2 className="text-2xl font-semibold mb-4">Error Loading Add Property Page</h2>
          <p className="text-red-600 mb-4">{fetchError}</p>
          <p>Please try again later or contact support.</p>
          <div className="mt-4 space-x-4">
            <Link
              to="/signup"
              className="inline-block bg-stone-600 text-white px-6 py-2 rounded shadow hover:bg-stone-500 transition"
            >
              Back to Sign Up
            </Link>
            <Link
              to="/listings"
              className="inline-block bg-stone-600 text-white px-6 py-2 rounded shadow hover:bg-stone-500 transition"
            >
              View Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section
        ref={sectionRef}
        className={`relative bg-cover bg-center text-white py-20 px-6 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{
          backgroundImage: `url(${bgabout})`,
          backgroundColor: bgabout ? 'transparent' : 'gray',
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-semibold mb-4 text-center">
            Add a Property to Zivaas Properties
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 text-center">
            Add your property to showcase it on our Listings page alongside your builder profile.
          </p>

          {submissionStatus && (
            <div
              className={`mb-6 p-4 rounded-lg text-center ${
                submissionStatus.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {submissionStatus.message}
            </div>
          )}

          {loading ? (
            <div className="text-center text-white text-lg">Loading builders...</div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto text-stone-800">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-700">
                    Property Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter property name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="property_type" className="block text-sm font-medium text-stone-700">
                    Property Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="property_type"
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                  >
                    <option value="">Select property type</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                  {errors.property_type && <p className="mt-1 text-sm text-red-600">{errors.property_type}</p>}
                </div>

                <div>
                  <label htmlFor="builder_id" className="block text-sm font-medium text-stone-700">
                    Builder (Optional)
                  </label>
                  <select
                    id="builder_id"
                    name="builder_id"
                    value={formData.builder_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                  >
                    <option value="">Select builder</option>
                    {builders.length > 0 ? (
                      builders.map((builder) => (
                        <option key={builder.id} value={builder.id}>
                          {builder.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No builders available (add a builder via Sign Up)
                      </option>
                    )}
                  </select>
                  {errors.builder_id && <p className="mt-1 text-sm text-red-600">{errors.builder_id}</p>}
                </div>

                <div>
                  <label htmlFor="images" className="block text-sm font-medium text-stone-700">
                    Property Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    id="images"
                    value={formData.images[0]}
                    onChange={(e) => handleArrayChange(e, 0, 'images')}
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter image URL (png, jpg, jpeg, gif)"
                  />
                  {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-stone-700">
                    Price (INR) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter price in INR"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-stone-700">
                    Location <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter location"
                  />
                  {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                </div>

                <div>
                  <label htmlFor="carpet_area" className="block text-sm font-medium text-stone-700">
                    Carpet Area (sq ft) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    id="carpet_area"
                    name="carpet_area"
                    value={formData.carpet_area}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter carpet area"
                  />
                  {errors.carpet_area && <p className="mt-1 text-sm text-red-600">{errors.carpet_area}</p>}
                </div>

                <div>
                  <label htmlFor="configuration" className="block text-sm font-medium text-stone-700">
                    Configuration <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="configuration"
                    name="configuration"
                    value={formData.configuration}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter BHK (e.g., 2 BHK)"
                  />
                  {errors.configuration && <p className="mt-1 text-sm text-red-600">{errors.configuration}</p>}
                </div>

                <div>
                  <label htmlFor="total_floors" className="block text-sm font-medium text-stone-700">
                    Total Floors <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    id="total_floors"
                    name="total_floors"
                    value={formData.total_floors}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter total floors"
                  />
                  {errors.total_floors && <p className="mt-1 text-sm text-red-600">{errors.total_floors}</p>}
                </div>

                <div>
                  <label htmlFor="total_units" className="block text-sm font-medium text-stone-700">
                    Total Units <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    id="total_units"
                    name="total_units"
                    value={formData.total_units}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter total units"
                  />
                  {errors.total_units && <p className="mt-1 text-sm text-red-600">{errors.total_units}</p>}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-stone-700">
                    Status <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                  >
                    <option value="">Select status</option>
                    <option value="Ready">Ready to Move</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                  {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                </div>

                <div>
                  <label htmlFor="rera_number" className="block text-sm font-medium text-stone-700">
                    RERA Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="rera_number"
                    name="rera_number"
                    value={formData.rera_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter RERA number"
                  />
                  {errors.rera_number && <p className="mt-1 text-sm text-red-600">{errors.rera_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Amenities <span className="text-red-600">*</span>
                  </label>
                  {formData.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2 mt-1">
                      <input
                        type="text"
                        value={amenity}
                        onChange={(e) => handleArrayChange(e, index, 'amenities')}
                        className="block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                        placeholder={`Enter amenity ${index + 1}`}
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeAmenity(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="mt-2 text-stone-600 hover:text-stone-900"
                  >
                    Add Amenity
                  </button>
                  {errors.amenities && <p className="mt-1 text-sm text-red-600">{errors.amenities}</p>}
                </div>

                <div>
                  <label htmlFor="developer_name" className="block text-sm font-medium text-stone-700">
                    Developer Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="developer_name"
                    name="developer_name"
                    value={formData.developer_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter developer name"
                  />
                  {errors.developer_name && <p className="mt-1 text-sm text-red-600">{errors.developer_name}</p>}
                </div>

                <div>
                  <label htmlFor="developer_tagline" className="block text-sm font-medium text-stone-700">
                    Developer Tagline (Optional)
                  </label>
                  <input
                    type="text"
                    id="developer_tagline"
                    name="developer_tagline"
                    value={formData.developer_tagline}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter developer tagline"
                  />
                  {errors.developer_tagline && <p className="mt-1 text-sm text-red-600">{errors.developer_tagline}</p>}
                </div>

                <div>
                  <label htmlFor="developer_experience" className="block text-sm font-medium text-stone-700">
                    Developer Experience (Years, Optional)
                  </label>
                  <input
                    type="number"
                    id="developer_experience"
                    name="developer_experience"
                    value={formData.developer_experience}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter years of experience"
                  />
                  {errors.developer_experience && (
                    <p className="mt-1 text-sm text-red-600">{errors.developer_experience}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="developer_projects_completed" className="block text-sm font-medium text-stone-700">
                    Developer Projects Completed (Optional)
                  </label>
                  <input
                    type="number"
                    id="developer_projects_completed"
                    name="developer_projects_completed"
                    value={formData.developer_projects_completed}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter number of projects completed"
                  />
                  {errors.developer_projects_completed && (
                    <p className="mt-1 text-sm text-red-600">{errors.developer_projects_completed}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="developer_happy_families" className="block text-sm font-medium text-stone-700">
                    Developer Happy Families (Optional)
                  </label>
                  <input
                    type="number"
                    id="developer_happy_families"
                    name="developer_happy_families"
                    value={formData.developer_happy_families}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter number of happy families"
                  />
                  {errors.developer_happy_families && (
                    <p className="mt-1 text-sm text-red-600">{errors.developer_happy_families}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Nearby Landmarks <span className="text-red-600">*</span>
                  </label>
                  {formData.nearby_landmarks.map((landmark, index) => (
                    <div key={index} className="flex space-x-2 mt-1">
                      <input
                        type="text"
                        value={landmark.name}
                        onChange={(e) => handleLandmarkChange(e, index, 'name')}
                        className="block w-2/3 rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                        placeholder="Landmark name"
                      />
                      <input
                        type="text"
                        value={landmark.distance}
                        onChange={(e) => handleLandmarkChange(e, index, 'distance')}
                        className="block w-1/3 rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                        placeholder="Distance (km)"
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeLandmark(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLandmark}
                    className="mt-2 text-stone-600 hover:text-stone-900"
                  >
                    Add Landmark
                  </button>
                  {errors.nearby_landmarks && <p className="mt-1 text-sm text-red-600">{errors.nearby_landmarks}</p>}
                </div>

                <div>
                  <label htmlFor="agent_name" className="block text-sm font-medium text-stone-700">
                    Agent Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="agent_name"
                    name="agent_name"
                    value={formData.agent_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter agent name"
                  />
                  {errors.agent_name && <p className="mt-1 text-sm text-red-600">{errors.agent_name}</p>}
                </div>

                <div>
                  <label htmlFor="agent_role" className="block text-sm font-medium text-stone-700">
                    Agent Role <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="agent_role"
                    name="agent_role"
                    value={formData.agent_role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter agent role"
                  />
                  {errors.agent_role && <p className="mt-1 text-sm text-red-600">{errors.agent_role}</p>}
                </div>

                <div>
                  <label htmlFor="agent_phone" className="block text-sm font-medium text-stone-700">
                    Agent Phone <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="agent_phone"
                    name="agent_phone"
                    value={formData.agent_phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter agent phone"
                  />
                  {errors.agent_phone && <p className="mt-1 text-sm text-red-600">{errors.agent_phone}</p>}
                </div>

                <div>
                  <label htmlFor="agent_email" className="block text-sm font-medium text-stone-700">
                    Agent Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    id="agent_email"
                    name="agent_email"
                    value={formData.agent_email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter agent email"
                  />
                  {errors.agent_email && <p className="mt-1 text-sm text-red-600">{errors.agent_email}</p>}
                </div>

                <div>
                  <label htmlFor="agent_availability" className="block text-sm font-medium text-stone-700">
                    Agent Availability (Optional)
                  </label>
                  <input
                    type="text"
                    id="agent_availability"
                    name="agent_availability"
                    value={formData.agent_availability}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter agent availability (e.g., Mon-Fri 9AM-5PM)"
                  />
                  {errors.agent_availability && (
                    <p className="mt-1 text-sm text-red-600">{errors.agent_availability}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="agent_rating" className="block text-sm font-medium text-stone-700">
                    Agent Rating (Optional)
                  </label>
                  <input
                    type="number"
                    id="agent_rating"
                    name="agent_rating"
                    value={formData.agent_rating}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter rating (0-5)"
                  />
                  {errors.agent_rating && <p className="mt-1 text-sm text-red-600">{errors.agent_rating}</p>}
                </div>

                <div>
                  <label htmlFor="agent_reviews" className="block text-sm font-medium text-stone-700">
                    Agent Reviews (Optional)
                  </label>
                  <input
                    type="number"
                    id="agent_reviews"
                    name="agent_reviews"
                    value={formData.agent_reviews}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter number of reviews"
                  />
                  {errors.agent_reviews && <p className="mt-1 text-sm text-red-600">{errors.agent_reviews}</p>}
                </div>

                <div>
                  <label htmlFor="agents_image" className="block text-sm font-medium text-stone-700">
                    Agent Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    id="agents_image"
                    value={formData.agents_image[0]}
                    onChange={(e) => handleArrayChange(e, 0, 'agents_image')}
                    className="mt-1 block w-full rounded-md border-stone-300 text-gray-900 shadow-sm focus:border-stone-600 focus:ring-stone-600"
                    placeholder="Enter agent image URL (png, jpg, jpeg, gif)"
                  />
                  {errors.agents_image && <p className="mt-1 text-sm text-red-600">{errors.agents_image}</p>}
                </div>

                <div className="text-center">
                  <button
                    onClick={handleSubmit}
                    className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white
    shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    Add Property
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Error Boundary Component
class AddPropertyErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in AddProperty:', error.message, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center text-stone-800">
            <h2 className="text-2xl font-semibold mb-4">Error Loading Add Property Page</h2>
            <p className="text-red-600 mb-4">{this.state.error?.message || 'Unknown error'}</p>
            <p>Please try again or contact support.</p>
            <div className="mt-4 space-x-4">
              <Link
                to="/signup"
                className="inline-block bg-stone-600 text-white px-6 py-2 rounded shadow hover:bg-stone-500 transition"
              >
                Back to Sign Up
              </Link>
              <Link
                to="/listings"
                className="inline-block bg-stone-600 text-white px-6 py-2 rounded shadow hover:bg-stone-500 transition"
              >
                View Listings
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default () => (
  <AddPropertyErrorBoundary>
    <AddProperty />
  </AddPropertyErrorBoundary>
);