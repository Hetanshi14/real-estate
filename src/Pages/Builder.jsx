import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Builder = () => {
  const [builders, setBuilders] = useState([]);
  const [error, setError] = useState(null);

  const sectionRefs = useRef([]);
  const [visibleSections, setVisibleSections] = useState([]);

  useEffect(() => {
    const fetchBuildersAndProperties = async () => {
      try {
        console.log('Fetching builders and properties...');
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
          setBuilders([]);
          setError('No builders found. Please try again later.');
          return;
        }

        // Group properties by developer_name
        const builderMap = new Map();
        data.forEach((property) => {
          const builderName = property.developer_name;
          if (!builderMap.has(builderName)) {
            builderMap.set(builderName, {
              name: builderName,
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
          builderMap.get(builderName).properties.push({
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

        const buildersArray = Array.from(builderMap.values());
        console.log('Mapped builders:', buildersArray);
        setBuilders(buildersArray);
        setError(null);
      } catch (error) {
        console.error('Error in fetchBuildersAndProperties:', error);
        setError(`Failed to load builders and properties: ${error.message}`);
        setBuilders([]);
      }
    };

    fetchBuildersAndProperties();
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
        className={`bg-gray-500 text-white py-16 transition-all duration-1000 transform ${isVisible('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Discover Premium Properties</h2>
          <p className="text-base mb-5 max-w-xl mx-auto">
            Explore a world of innovative and sustainable real estate solutions from our top builders.
          </p>
          <a
            href="#builders"
            className="inline-block bg-white text-blue-900 font-medium py-2 px-5 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Explore Now
          </a>
        </div>
      </section>

      {/* Builders Section */}
      <section
        id="builders"
        ref={(el) => (sectionRefs.current[1] = el)}
        className={`max-w-7xl mx-auto py-12 px-4 transition-all duration-1000 transform ${isVisible('builders') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">
          Our Esteemed Builders
        </h2>
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg max-w-2xl mx-auto mb-8 text-center shadow-sm">
            {error}
          </div>
        )}
        {builders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builders.map((builder) => (
              <div
                key={builder.name}
                className="bg-white border border-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{builder.name}</h3>
                <p className="text-base text-gray-500 italic mb-4">{builder.tagline}</p>
                <div className="grid grid-cols-2 gap-3 text-gray-700 mb-4">
                  <div>
                    <p><strong className="text-gray-900">Experience:</strong> {builder.experience} years</p>
                    <p><strong className="text-gray-900">Projects:</strong> {builder.projectsCompleted}</p>
                    <p><strong className="text-gray-900">Families:</strong> {builder.happyFamilies}</p>
                  </div>
                  <div>
                    <p><strong className="text-gray-900">Awards:</strong> {builder.awards}</p>
                    <p><strong className="text-gray-900">Certifications:</strong> {builder.certifications}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  <strong className="text-gray-900">Description:</strong> {builder.description}
                </p>
                
                <Link
                  to={`/properties/builder/${encodeURIComponent(builder.name)}`}
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

export default Builder;