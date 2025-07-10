import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import bgabout from '../assets/bgabout.jpg';
import img1 from '../assets/img1.jpg';
import img2 from '../assets/img2.jpg';
import img3 from '../assets/img3.jpg';
import img4 from '../assets/img4.jpg';
import comm1 from '../assets/comm1.jpg';
import resident1 from '../assets/resident1.jpg';

const AboutUs = () => {
  const sectionRefs = useRef([]);
  const [visibleSections, setVisibleSections] = useState([]);
  const bannerRef = useRef(null);
  const [bannerInView, setBannerInView] = useState(false);
  const [builders, setBuilders] = useState([]);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'About Us - Zivaas Properties';

    const fetchData = async () => {
      try {
        // Fetch builders
        const { data: buildersData, error: buildersError } = await supabase
          .from('builders')
          .select('*')
          .order('name', { ascending: true });

        if (buildersError) {
          console.error('Builders fetch error:', buildersError.message);
          throw new Error('Failed to fetch builders.');
        }

        setBuilders(buildersData.map(b => ({
          ...b,
          logo_url: b.logo_url || 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//default%20logo.jpg'
        })));

        // Fetch properties
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .order('name', { ascending: true });

        if (propertiesError) {
          console.error('Properties fetch error:', propertiesError.message);
          throw new Error('Failed to fetch properties.');
        }

        setProperties(propertiesData.map(p => ({
          ...p,
          image_url: p.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
        })));
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError(err.message);
        setBuilders([]);
        setProperties([]);
      }
    };

    fetchData();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === bannerRef.current && entry.isIntersecting) {
            setBannerInView(true);
          }

          if (entry.isIntersecting && !visibleSections.includes(entry.target.id)) {
            setVisibleSections((prev) => [...prev, entry.target.id]);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (bannerRef.current) observer.observe(bannerRef.current);
    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      if (bannerRef.current) observer.unobserve(bannerRef.current);
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [visibleSections]);

  const isVisible = (id) => visibleSections.includes(id);

  return (
    <div className="min-h-screen">
      <section
        ref={bannerRef}
        className={`relative bg-cover bg-center text-white h-[80vh] flex items-center pt-20 px-6 pb-20 transition-all duration-1000 transform ${
          bannerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ backgroundImage: `url(${bgabout})` }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-semibold mb-3">Connecting Builders with Dream Homes</h1>
          <p className="text-2xl md:text-xl text-gray-200">
            At <strong>Zivaas Properties</strong>, we empower builders to showcase their projects and connect with customers seeking their perfect home. Our platform bridges visionaries with homebuyers, creating communities that thrive.
          </p>
          <div className="flex justify-start gap-4 mt-6 flex-wrap">
            <Link
              to="/signup"
              className="bg-yellow-600 text-white px-6 py-2 rounded shadow hover:bg-yellow-500 transition"
            >
              Join as a Builder
            </Link>
            <Link
              to="/listings"
              className="border border-white px-6 py-2 rounded text-white hover:bg-white hover:text-stone-700 transition"
            >
              Explore Properties
            </Link>
          </div>
        </div>
      </section>

      <section
        id="section1"
        ref={(el) => (sectionRefs.current[0] = el)}
        className={`py-16 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center transition-all duration-1000 transform ${
          isVisible('section1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div>
          <h2 className="text-4xl font-bold mb-4">
            Empowering Builders to <span className="text-yellow-600">Shape Futures</span>
          </h2>
          <p className="text-lg mb-4 text-stone-600">
            Since 2011, Zivaas Properties has been the go-to platform for builders to showcase their projects, from luxurious residences to modern commercial spaces, reaching customers eager to find their dream properties.
          </p>
          <p className="text-stone-500">
            Our mission is to simplify the real estate journey. Builders can easily post their projects and connect with buyers, while customers discover homes that match their aspirations. With innovative tools and a customer-centric approach, we create lasting connections that transform skylines and lives.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10">
            {[
              { stat: '15+', label: 'Years of Excellence' },
              { stat: '100+', label: 'Projects Showcased' },
              { stat: '500+', label: 'Builders Partnered' },
              { stat: '10K+', label: 'Happy Customers' },
            ].map(({ stat, label }, i) => (
              <div key={i} className="text-center">
                <h3 className="text-3xl font-bold text-yellow-600">{stat}</h3>
                <p className="text-sm text-stone-600 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[img1, img2, img3, img4].map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Project ${i + 1}`}
              className="rounded-lg shadow-lg object-cover h-60 w-full"
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
        className={`bg-stone-100 py-16 px-6 transition-all duration-1000 transform ${
          isVisible('section2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-4xl font-bold text-center text-stone-700 mb-4">Our Purpose & Promise</h2>
        <p className="text-center text-stone-500 mb-12 max-w-3xl mx-auto">
          We are dedicated to creating a platform that empowers builders and delights customers, fostering communities through exceptional real estate experiences.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-semibold text-yellow-700 mb-4">Our Purpose</h3>
            <p className="text-stone-600 mb-4">
              To provide builders with a powerful platform to showcase their projects and connect directly with customers, delivering seamless, transparent real estate solutions.
            </p>
            <ul className="text-stone-600 space-y-2 pl-5 list-disc">
              <li>Builder-Friendly Tools</li>
              <li>Customer-Centric Design</li>
              <li>Innovative Technology</li>
              <li>Trusted Partnerships</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-semibold text-yellow-700 mb-4">Our Promise</h3>
            <p className="text-stone-600">
              To be the leading real estate platform where builders thrive and customers find their dream homes, creating lasting value for communities.
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
        className={`py-16 px-6 bg-white transition-all duration-1000 transform ${
          isVisible('section3') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-4xl font-bold text-center text-stone-800 mb-4">Our Expertise</h2>
        <p className="text-center text-stone-500 mb-12 max-w-3xl mx-auto">
          With a robust platform and deep industry knowledge, we enable builders to showcase diverse projects and help customers find properties that suit their needs.
        </p>

        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={comm1}
              alt="Commercial Construction"
              className="h-64 w-full object-cover"
              onError={(e) => {
                console.error(`Failed to load image: ${e.target.src}`);
                e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80';
              }}
            />
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-stone-800 mb-4">Commercial Construction</h3>
              <p className="text-stone-600 mb-4">
                Our platform supports builders in showcasing sophisticated commercial spaces that blend functionality with innovative design, from corporate offices to retail complexes.
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
              src={resident1}
              alt="Residential Construction"
              className="h-64 w-full object-cover"
              onError={(e) => {
                console.error(`Failed to load image: ${e.target.src}`);
                e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80';
              }}
            />
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-stone-800 mb-4">Residential Construction</h3>
              <p className="text-stone-600 mb-4">
                We enable builders to present luxurious homes and multi-unit developments, helping customers find spaces where they love to live.
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
        id="section4"
        ref={(el) => (sectionRefs.current[3] = el)}
        className={`py-16 px-6 bg-stone-100 transition-all duration-1000 transform ${
          isVisible('section4') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-4xl font-bold text-center text-stone-800 mb-4">Featured Builders</h2>
        <p className="text-center text-stone-500 mb-12 max-w-3xl mx-auto">
          Discover our trusted builders and their exceptional projects. Join as a builder to showcase your properties or explore listings to find your dream home.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center max-w-6xl mx-auto">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {builders.length > 0 ? (
            builders.map((builder) => {
              const builderProperties = properties.filter(p => p.builder_id === builder.id);
              return (
                <div key={builder.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={builder.logo_url}
                      alt={`${builder.name} logo`}
                      className="w-16 h-16 object-cover rounded-full border"
                      onError={(e) => {
                        console.error(`Failed to load builder logo: ${e.target.src}`);
                        e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80';
                      }}
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-stone-700">{builder.name}</h3>
                      <p className="text-stone-600 text-sm">{builder.contact}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-stone-700 mb-2">Projects</h4>
                    {builderProperties.length > 0 ? (
                      <ul className="list-disc list-inside text-stone-600 space-y-1">
                        {builderProperties.map((property) => (
                          <li key={property.id}>
                            <Link
                              to={`/listings/${property.id}`}
                              className="text-stone-600 hover:text-yellow-600 hover:underline"
                            >
                              {property.name} ({property.type})
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-stone-600 text-sm">No projects listed yet.</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-stone-600 text-lg col-span-full">
              No builders found.
            </p>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/signup"
            className="inline-block bg-yellow-600 text-white px-6 py-2 rounded shadow hover:bg-yellow-500 transition mr-4"
          >
            Join as a Builder
          </Link>
          <Link
            to="/listings"
            className="inline-block border border-stone-600 text-stone-600 px-6 py-2 rounded hover:bg-stone-600 hover:text-white transition"
          >
            Browse All Properties
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;