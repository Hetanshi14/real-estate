import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import bgabout from '../assets/bgabout.jpg';

const SignUp = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    logo_url: '',
    tagline: '',
    experience: '',
    projects_completed: '',
    happy_families: '',
  });
  const [errors, setErrors] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState(null);

  useEffect(() => {
    document.title = 'Sign Up - Zivaas Properties';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Builder name is required';
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact is required';
    } else {
      // Prefer email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact)) {
        newErrors.contact = 'Please enter a valid email address';
      }
    }
    if (formData.experience && (isNaN(formData.experience) || formData.experience < 0)) {
      newErrors.experience = 'Experience must be a non-negative number';
    }
    if (formData.projects_completed && (isNaN(formData.projects_completed) || formData.projects_completed < 0)) {
      newErrors.projects_completed = 'Projects completed must be a non-negative number';
    }
    if (formData.happy_families && (isNaN(formData.happy_families) || formData.happy_families < 0)) {
      newErrors.happy_families = 'Happy families must be a non-negative number';
    }
    if (formData.logo_url && !/^https?:\/\/.*\.(?:png|jpg|jpeg|gif)$/.test(formData.logo_url)) {
      newErrors.logo_url = 'Please enter a valid image URL (png, jpg, jpeg, gif)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmissionStatus(null);
      const { data, error } = await supabase.from('builders').insert([
        {
          name: formData.name.trim(),
          contact: formData.contact.trim(),
          logo_url: formData.logo_url ? formData.logo_url.trim() : null,
          tagline: formData.tagline ? formData.tagline.trim() : null,
          experience: formData.experience ? parseInt(formData.experience, 10) : null,
          projects_completed: formData.projects_completed ? parseInt(formData.projects_completed, 10) : null,
          happy_families: formData.happy_families ? parseInt(formData.happy_families, 10) : null,
        },
      ]);

      if (error) {
        console.error('Submission error:', error.message);
        if (error.message.includes('duplicate key value violates unique constraint')) {
          setSubmissionStatus({ type: 'error', message: 'Builder name already exists' });
        } else {
          setSubmissionStatus({ type: 'error', message: 'Failed to register builder: ' + error.message });
        }
        return;
      }

      setSubmissionStatus({
        type: 'success',
        message: (
          <>
            Builder registered successfully! Your profile is now visible on the{' '}
            <Link to="/about" className="underline text-green-600 hover:text-green-800">
              About Us
            </Link>{' '}
            page. Add properties to appear on the{' '}
            <Link to="/add-property" className="underline text-green-600 hover:text-green-800">
              Add Property
            </Link>{' '}
            page.
          </>
        ),
      });
      setFormData({
        name: '',
        contact: '',
        logo_url: '',
        tagline: '',
        experience: '',
        projects_completed: '',
        happy_families: '',
      });
      setErrors({});
      setTimeout(() => navigate('/about'), 10000); // Redirect after 3 seconds
    } catch (err) {
      console.error('Unexpected error:', err.message);
      setSubmissionStatus({ type: 'error', message: 'An unexpected error occurred' });
    }
  };

  return (
    <div className="min-h-screen">
      <section
        ref={sectionRef}
        className={`relative bg-cover bg-center text-white py-20 px-6 transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ backgroundImage: `url(${bgabout})` }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-semibold mb-4 text-center">
            Join Zivaas Properties as a Builder
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 text-center">
            Showcase your projects and connect with customers. Your profile will appear on our About Us page, and your properties will be featured on our Listings page.
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

          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto text-stone-800">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700">
                  Builder Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-yellow-600 focus:ring-yellow-600"
                  placeholder="Enter builder name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-stone-700">
                  Contact Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-yellow-600 focus:ring-yellow-600"
                  placeholder="Enter email address"
                />
                {errors.contact && <p className="mt-1 text-sm text-red-600">{errors.contact}</p>}
              </div>

              <div>
                <label htmlFor="logo_url" className="block text-sm font-medium text-stone-700">
                  Logo URL (Optional)
                </label>
                <input
                  type="text"
                  id="logo_url"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-yellow-600 focus:ring-yellow-600"
                  placeholder="Enter logo image URL (png, jpg, jpeg, gif)"
                />
                {errors.logo_url && <p className="mt-1 text-sm text-red-600">{errors.logo_url}</p>}
                <p className="mt-1 text-sm text-stone-600">
                  Leave blank to use our default logo.
                </p>
              </div>

              <div>
                <label htmlFor="tagline" className="block text-sm font-medium text-stone-700">
                  Tagline (Optional)
                </label>
                <input
                  type="text"
                  id="tagline"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-yellow-600 focus:ring-yellow-600"
                  placeholder="Enter tagline"
                />
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-stone-700">
                  Experience (Years, Optional)
                </label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-yellow-600 focus:ring-yellow-600"
                  placeholder="Enter years of experience"
                />
                {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience}</p>}
              </div>

              <div>
                <label htmlFor="projects_completed" className="block text-sm font-medium text-stone-700">
                  Projects Completed (Optional)
                </label>
                <input
                  type="number"
                  id="projects_completed"
                  name="projects_completed"
                  value={formData.projects_completed}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-yellow-600 focus:ring-yellow-600"
                  placeholder="Enter number of projects completed"
                />
                {errors.projects_completed && (
                  <p className="mt-1 text-sm text-red-600">{errors.projects_completed}</p>
                )}
              </div>

              <div>
                <label htmlFor="happy_families" className="block text-sm font-medium text-stone-700">
                  Happy Families (Optional)
                </label>
                <input
                  type="number"
                  id="happy_families"
                  name="happy_families"
                  value={formData.happy_families}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-yellow-600 focus:ring-yellow-600"
                  placeholder="Enter number of happy families"
                />
                {errors.happy_families && <p className="mt-1 text-sm text-red-600">{errors.happy_families}</p>}
              </div>

              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white shadow transition"
                >
                  Register Builder
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignUp;