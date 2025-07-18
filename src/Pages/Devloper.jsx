import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Developer = () => {
  const [developers, setDevelopers] = useState([]);
  const [error, setError] = useState(null);

  const sectionRefs = useRef([]);
  const [visibleSections, setVisibleSections] = useState([]);

  useEffect(() => {
    const fetchDevelopersAndProperties = async () => {
      try {
        console.log('Fetching developers and properties...');
        const { data, error: fetchError } = await supabase
          .from('properties')
          .select(`
            id, name, property_type, images, price, location, status, configuration,
            total_floors, total_units, carpet_area, rera_number, amenities,
            developer_name, developer_tagline, developer_experience,
            developer_projects_completed, developer_happy_families, nearby_landmarks,
            developer_awards, developer_certifications, developer_description
          `);

        if (fetchError) {
          console.error('Supabase fetch error:', fetchError.message);
          throw new Error(`Supabase error: ${fetchError.message}`);
        }

        console.log('Raw data from Supabase:', data);

        if (!data || data.length === 0) {
          console.warn('No properties found in database');
          setDevelopers([]);
          setError('No developers found. Please try again later.');
          return;
        }

        // Group properties by developer_name
        const developerMap = new Map();
        data.forEach((property) => {
          const developerName = property.developer_name;
          if (!developerMap.has(developerName)) {
            developerMap.set(developerName, {
              name: developerName,
              tagline: property.developer_tagline || 'No tagline',
              experience: property.developer_experience || 0,
              projectsCompleted: property.developer_projects_completed || 0,
              happyFamilies: property.developer_happy_families || 0,
              awards: property.developer_awards || 'None',
              certifications: property.developer_certifications || 'None',
              description: property.developer_description || 'No description available.',
              properties: [],
            });
          }
          developerMap.get(developerName).properties.push({
            id: property.id,
            name: property.name || 'Unnamed Property',
            type: property.property_type || 'Unknown',
            location: property.location || 'Unknown',
            status: property.status || 'Unknown',
            image: property.images.length > 0 ? property.images[0] || null : null,
            carpetArea: property.carpet_area || 0,
            reraNumber: property.rera_number || 'N/A',
          });
        });

        const developersArray = Array.from(developerMap.values());
        console.log('Mapped developers:', developersArray);
        setDevelopers(developersArray);
        setError(null);
      } catch (error) {
        console.error('Error in fetchDevelopersAndProperties:', error);
        setError(`Failed to load developers and properties: ${error.message}`);
        setDevelopers([]);
      }
    };

    fetchDevelopersAndProperties();
  }, []);

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

  const isVisible = (id) => visibleSections.includes(id);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Hero Section */}
      <section
        id="hero"
        ref={(el) => (sectionRefs.current[0] = el)}
        className={`bg-cover bg-center text-white py-48 transition-all duration-1000 transform ${isVisible('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ backgroundImage: `url(https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Bg%20img/bgdev.jpg)` }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-3">Discover Premium Properties</h2>
          <p className="text-base mb-5 max-w-xl mx-auto">
            Explore a world of innovative and sustainable real estate solutions from our top developers.
          </p>
          <a
            href="#developers"
            className="inline-block bg-white text-blue-900 font-medium py-2 px-5 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Explore Now
          </a>
        </div>
      </section>

      {/* Developers Section */}
      <section
        id="developers"
        ref={(el) => (sectionRefs.current[1] = el)}
        className={`max-w-7xl mx-auto py-12 px-4 transition-all duration-1000 transform ${isVisible('developers') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">
          Our Esteemed Developers
        </h2>
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg max-w-2xl mx-auto mb-8 text-center shadow-sm">
            {error}
          </div>
        )}
        {developers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developers.map((developer) => (
              <div
                key={developer.name}
                className="bg-white border border-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{developer.name}</h3>
                <p className="text-base text-gray-500 italic mb-4">{developer.tagline}</p>
                <div className="grid grid-cols-2 gap-3 text-gray-700 mb-4">
                  <div>
                    <p><strong className="text-gray-900">Experience:</strong> {developer.experience} years</p>
                    <p><strong className="text-gray-900">Projects:</strong> {developer.projectsCompleted}</p>
                    <p><strong className="text-gray-900">Families:</strong> {developer.happyFamilies}</p>
                  </div>
                  <div>
                    <p><strong className="text-gray-900">Awards:</strong> {developer.awards}</p>
                    <p><strong className="text-gray-900">Certifications:</strong> {developer.certifications}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  <strong className="text-gray-900">Description:</strong> {developer.description}
                </p>
                <Link
                  to={`/properties/developer/${encodeURIComponent(developer.name)}`}
                  className="mt-4 inline-block bg-stone-700 text-white font-medium py-2 px-4 rounded-full hover:bg-stone-600 transition-all duration-200 text-sm"
                >
                  View All
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Developer;