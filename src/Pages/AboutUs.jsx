import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

// Logo URL
const LOGO_URL = "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/logo/zivaaslogo01.jpg";

const AboutUs = () => {
  const sectionRefs = useRef([]);
  const [visibleSections, setVisibleSections] = useState(['section1', 'section2', 'section3', 'core-values']); // Initialize with all sections visible
  const bannerRef = useRef(null);
  const [bannerInView, setBannerInView] = useState(true); // Initialize banner as visible
  const [developers, setDevelopers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // New loading state

  useEffect(() => {
    document.title = 'About Us - Zivaas Properties';

    const fetchData = async () => {
      try {
        setIsLoading(true); // Start loading
        // Fetch users with role 'developer'
        const { data: developersData, error: developersError } = await supabase
          .from('users')
          .select('id, username, email, created_at, updated_at')
          .eq('role', 'developer')
          .order('username', { ascending: true });
        console.log('Developers Data:', developersData);
        console.log('Developers Error:', developersError);

        if (developersError) {
          console.error('Developers fetch error:', developersError.message);
          throw new Error('Failed to fetch developers.');
        }

        // Fetch properties with updated schema
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select(`
            id,
            name,
            location,
            price,
            carpet_area,
            configuration,
            property_type,
            total_floors,
            total_units,
            status,
            rera_number,
            amenities,
            developer_name,
            developer_tagline,
            developer_experience,
            developer_projects_completed,
            developer_happy_families,
            nearby_landmarks,
            agent_name,
            agent_role,
            agent_phone,
            agent_email,
            agent_availability,
            agent_rating,
            agent_reviews,
            images,
            created_at,
            updated_at,
            agents_image,
            developer_id
          `)
          .order('name', { ascending: true });
        console.log('Properties Data:', propertiesData);
        console.log('Properties Error:', propertiesError);

        if (propertiesError) {
          console.error('Properties fetch error:', propertiesError.message);
          throw new Error('Failed to fetch properties.');
        }

        // Map properties data, handling images array
        setProperties(
          propertiesData.map((p) => ({
            ...p,
            image_url: p.images && p.images.length > 0 ? p.images[0] : '',
          }))
        );
        setDevelopers(developersData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError(err.message);
        setDevelopers([]);
        setProperties([]);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchData();
  }, []);

  // Render loading screen if isLoading is true
  if (isLoading) {
    return (
      <div className="col-span-full flex justify-center items-center min-h-screen w-auto h-72">
        <motion.img
          src={LOGO_URL}
          alt="Zivaas Properties Logo"
          className="h-32 w-auto object-contain animate-pulse"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section
        ref={bannerRef}
        className="relative bg-cover bg-center text-white h-[80vh] flex items-center pt-20 px-6 pb-20 transition-all duration-1000"
        style={{ backgroundImage: `url(https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Bg%20img/bgabout.jpg)` }}
        onError={(e) => {
          console.error('Banner background image load failed');
          e.target.style.backgroundImage = 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80)';
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-semibold mb-3">Connecting Developers with Dream Homes</h1>
          <p className="text-2xl md:text-xl text-gray-200">
            At <strong>Zivaas Properties</strong>, we empower developers to showcase their projects and connect with customers seeking their perfect home. Our platform bridges visionaries with homebuyers, creating communities that thrive.
          </p>
          <div className="flex justify-start gap-4 mt-6 flex-wrap">
            <Link
              to="/signup"
              className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-800 z-10 overflow-hidden
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
            >
              Join as a Developer
            </Link>
            <Link
              to="/listings"
              className="relative inline-block px-6 py-2 rounded font-medium text-white border border-white z-10 overflow-hidden
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-white
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-stone-700 transition"
            >
              Explore Properties
            </Link>
          </div>
        </div>
      </section>

      <section
        id="section1"
        ref={(el) => (sectionRefs.current[0] = el)}
        className="py-16 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center transition-all duration-1000"
      >
        <div>
          <h2 className="text-4xl font-bold mb-4">
            Empowering Developers to <span className="text-stone-500">Shape Futures</span>
          </h2>
          <p className="text-lg mb-4 text-stone-600">
            Since 2011, Zivaas Properties has been the go-to platform for developers to showcase their projects, from luxurious residences to modern commercial spaces, reaching customers eager to find their dream properties.
          </p>
          <p className="text-stone-500">
            Our mission is to simplify the real estate journey. Developers can easily post their projects and connect with buyers, while customers discover homes that match their aspirations. With innovative tools and a customer-centric approach, we create lasting connections that transform skylines and lives.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10">
            {[
              { stat: '15+', label: 'Years of Excellence' },
              { stat: '100+', label: 'Projects Showcased' },
              { stat: '500+', label: 'Developers Partnered' },
              { stat: '10K+', label: 'Happy Customers' },
            ].map(({ stat, label }, i) => (
              <div key={i} className="text-center">
                <h3 className="text-3xl font-bold text-stone-600">{stat}</h3>
                <p className="text-sm text-stone-600 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/about%20img/img1.jpg',
            'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/about%20img/img2.jpg',
            'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/about%20img/img3.jpg',
            'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/about%20img/img4.jpg',
          ].map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Project ${i + 1}`}
              className="rounded-lg shadow-lg h-60 w-full"
              onError={(e) => {
                console.error(`Failed to load image: ${e.target.src}`);
                e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80';
              }}
            />
          ))}
        </div>
      </section>

      <section
        id="section2"
        ref={(el) => (sectionRefs.current[1] = el)}
        className="bg-stone-100 py-16 px-6 transition-all duration-1000"
      >
        <h2 className="text-4xl font-bold text-center text-stone-700 mb-4">Our Purpose & Promise</h2>
        <p className="text-center text-stone-500 mb-12 max-w-3xl mx-auto">
          We are dedicated to creating a platform that empowers developers and delights customers, fostering communities through exceptional real estate experiences.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-semibold text-stone-700 mb-4">Our Purpose</h3>
            <p className="text-stone-600 mb-4">
              To provide developers with a powerful platform to showcase their projects and connect directly with customers, delivering seamless, transparent real estate solutions.
            </p>
            <ul className="text-stone-600 space-y-2 pl-5 list-disc">
              <li>Developer-Friendly Tools</li>
              <li>Customer-Centric Design</li>
              <li>Innovative Technology</li>
              <li>Trusted Partnerships</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-semibold text-stone-700 mb-4">Our Promise</h3>
            <p className="text-stone-600">
              To be the leading real estate platform where developers thrive and customers find their dream homes, creating lasting value for communities.
            </p>
            <p className="text-stone-600 mt-3">
              We envision a future where every project on Zivaas Properties inspires trust, innovation, and connection, transforming the way people buy and build homes.
            </p>
          </div>
        </div>
      </section>

      <section
        id="section3"
        ref={(el) => (sectionRefs.current[2] = el)}
        className="py-16 px-6 bg-white transition-all duration-1000"
      >
        <h2 className="text-4xl font-bold text-center text-stone-800 mb-4">Our Expertise</h2>
        <p className="text-center text-stone-500 mb-12 max-w-3xl mx-auto">
          With a robust platform and deep industry knowledge, we enable developers to showcase diverse projects and help customers find properties that suit their needs.
        </p>

        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src="https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/about%20img/commercial.jpeg"
              alt="Commercial Construction"
              className="h-64 w-full"
              onError={(e) => {
                console.error(`Failed to load image: ${e.target.src}`);
                e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80';
              }}
            />
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-stone-800 mb-4">Commercial Construction</h3>
              <p className="text-stone-600 mb-4">
                Our platform supports developers in showcasing sophisticated commercial spaces that blend functionality with innovative design, from corporate offices to retail complexes.
              </p>
              <ul className="list-disc list-inside text-stone-600 space-y-1">
                <li>Office Buildings & Corporate Campuses</li>
                <li>Hospitality & Restaurants</li>
                <li>Retail & Shopping Centers</li>
                <li>Medical Facilities & Healthcare</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src="https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/about%20img/residental.jpeg"
              alt="Residential Construction"
              className="h-64 w-full"
              onError={(e) => {
                console.error(`Failed to load image: ${e.target.src}`);
                e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80';
              }}
            />
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-stone-800 mb-4">Residential Construction</h3>
              <p className="text-stone-600 mb-4">
                We enable developers to present luxurious homes and multi-unit developments, helping customers find spaces where they love to live.
              </p>
              <ul className="list-disc list-inside text-stone-600 space-y-1">
                <li>Custom Luxury Homes</li>
                <li>Residential Complexes</li>
                <li>Multi-Family Residences</li>
                <li>Home Renovations & Additions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="core-values"
        className="bg-stone-100 text-stone-700 py-16 px-4"
      >
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-stone-800">
            Our Core Values
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center">
            <div>
              <div className="bg-stone-200 rounded-full h-20 w-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-stone-700 text-3xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-stone-800">Integrity</h3>
              <p className="text-sm text-stone-600">
                We uphold the highest standards of honesty, ensuring trust and accountability in all our actions.
              </p>
            </div>

            <div>
              <div className="bg-stone-200 rounded-full h-20 w-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-stone-700 text-3xl">🏢</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-stone-800">Excellence</h3>
              <p className="text-sm text-stone-600">
                We relentlessly pursue superior quality, delivering exceptional results that inspire confidence.
              </p>
            </div>

            <div>
              <div className="bg-stone-200 rounded-full h-20 w-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-stone-700 text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-stone-800">Innovation</h3>
              <p className="text-sm text-stone-600">
                We drive progress by embracing bold ideas and pioneering solutions for a better future.
              </p>
            </div>

            <div>
              <div className="bg-stone-200 rounded-full h-20 w-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-stone-700 text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-stone-800">Collaboration</h3>
              <p className="text-sm text-stone-600">
                We foster meaningful partnerships, uniting diverse perspectives to achieve collective success.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;