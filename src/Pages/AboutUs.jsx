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
  const [agents, setAgents] = useState([]);
  const [properties, setProperties] = useState([]);
  const [errorAgents, setErrorAgents] = useState(null);
  const [errorProperties, setErrorProperties] = useState(null);

  const sectionRefs = useRef([]);
  const [visibleSections, setVisibleSections] = useState([]);

  const bannerRef = useRef(null);
  const [bannerInView, setBannerInView] = useState(false);

  useEffect(() => {
    document.title = 'About Us - Zivaas Properties';

    const fetchData = async () => {
      try {
        console.log('Fetching agents from Supabase');
        const { data: agentsData, error: agentsError } = await supabase
          .from('agents')
          .select('*');

        if (agentsError) {
          console.error('Agents fetch error:', agentsError.message);
          throw new Error('Failed to fetch agents.');
        }

        console.log('Fetched agents:', agentsData);
        setAgents(agentsData.map(a => ({
          ...a,
          photo: a.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80'
        })));
        setErrorAgents(null);

        console.log('Fetching properties from Supabase');
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*');

        if (propertiesError) {
          console.error('Properties fetch error:', propertiesError.message);
          throw new Error('Failed to fetch properties.');
        }

        console.log('Fetched properties:', propertiesData);
        setProperties(propertiesData.map(p => ({
          ...p,
          agentId: p.agent_id
        })));
        setErrorProperties(null);
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setErrorAgents(error.message);
        setErrorProperties(error.message);
        setAgents([]);
        setProperties([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
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
        className={`relative bg-cover bg-center text-white h-[80vh] flex items-center p-20 transition-all duration-1000 transform ${
          bannerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ backgroundImage: `url(${bgabout})` }}>
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 px-6 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-semibold mb-3">Building Excellence Since 2011</h1>
          <p className="text-2xl md:text-xl text-gray-200">
            We are <strong>Zivaas Properties</strong>, a premier real estate brand delivering innovative, reliable, and future-ready residential & commercial spaces.
            Our journey spans over two decades — transforming skylines and enriching lives.
          </p>
          <div className="flex justify-start gap-4 mt-6 flex-wrap">
            <Link
              to="/contact"
              className="bg-yellow-600 text-white px-6 py-2 rounded shadow hover:bg-yellow-500 transition">
              Contact Us
            </Link>
            <Link
              to="/listings"
              className="border border-white px-6 py-2 rounded text-white hover:bg-white hover:text-stone-700 transition">
              View Our Projects
            </Link>
          </div>
        </div>
      </section>

      <section
        id="section1"
        ref={(el) => (sectionRefs.current[0] = el)}
        className={`py-16 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center transition-all duration-1000 transform ${
          isVisible('section1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div>
          <h2 className="text-4xl font-bold mb-4">
            Turning Blueprints into <span className="text-yellow-600">Landmarks</span>
          </h2>
          <p className="text-lg mb-4 text-stone-600">
            Since 2011, Zivaas has been turning blueprints into iconic landmarks, setting new benchmarks in Ahmedabad’s real estate landscape. From elegant residences to thriving commercial hubs, we transform visionary plans into remarkable spaces that shape communities and stand the test of time.
          </p>
          <p className="text-stone-500">
            At Zivaas, our team is driven by a shared passion for transforming architectural blueprints into landmark spaces. With years of combined expertise, we deliver more than just buildings—we craft enduring legacies. Every project reflects our commitment to innovation, meticulous planning, and a deep understanding of community needs, shaping spaces that elevate lifestyles and define skylines.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10">
            {[
              { stat: '15+', label: 'Years of Experience' },
              { stat: '100+', label: 'Projects Completed' },
              { stat: '50+', label: 'Team Members' },
              { stat: '25+', label: 'Industry Awards' },
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
              alt={`About ${i}`}
              className="rounded-lg shadow-lg object-cover h-60 w-full"
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
          Our purpose is to create exceptional spaces that inspire, empower communities, and enrich everyday living.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-semibold text-yellow-700 mb-4">Our Purpose</h3>
            <p className="text-stone-600 mb-4">
              Our promise is to deliver innovative, sustainable, and customer-focused real estate solutions that exceed expectations and build lasting trust.
            </p>
            <ul className="text-stone-600 space-y-2 pl-5 list-disc">
              <li>Architectural Distinction</li>
              <li>Community-Centric Development</li>
              <li>Future-Ready Innovation</li>
              <li> Superior After-Sales Support</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-semibold text-yellow-700 mb-4">Our Promise</h3>
            <p className="text-stone-600">
              To be recognized as a trusted leader in real estate, creating transformative spaces that empower communities and inspire future generations.
            </p>
            <p className="text-stone-600 mt-3">
              We envision a future where every Zivaas project is a symbol of design brilliance, environmental care, and long-lasting impact.
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
          With specialized teams and extensive experience, we deliver exceptional results across various construction sectors.
        </p>

        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={comm1} alt="Commercial Construction" className="h-64 w-full object-cover" />
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-stone-800 mb-4">Commercial Construction</h3>
              <p className="text-stone-600 mb-4">
                We specialize in developing sophisticated commercial spaces that combine functionality with striking design.
                From corporate headquarters to retail complexes, our commercial construction services cover:
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
            <img src={resident1} alt="Residential Construction" className="h-64 w-full object-cover" />
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-stone-800 mb-4">Residential Construction</h3>
              <p className="text-stone-600 mb-4">
                Our residential projects range from luxurious single-family homes to multi-unit developments, all built with
                attention to detail and a focus on creating spaces where people love to live. Our residential services include:
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
        className={`px-6 py-12 transition-all duration-1000 transform ${
          isVisible('section4') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-4xl font-bold text-stone-700 text-center mb-8">Meet Our Team</h2>
        <p className="max-w-3xl mx-auto text-center text-stone-600 mb-12">
          At Zivaas Properties, our dedicated agents bring years of experience and a passion for real estate to help you find the perfect home. Get to know the people who make your dreams a reality.
        </p>
        {(errorAgents || errorProperties) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {errorAgents || errorProperties}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {agents.length > 0 ? (
            agents.map((agent) => {
              const agentProperties = properties.filter(p => p.agentId === agent.id);
              return (
                <div className="shadow-md p-4 rounded-lg" key={agent.id}>
                  <h2 className="text-xl font-semibold text-stone-700 mb-2">{agent.name}</h2>
                  <div className="flex items-center gap-6 mb-3">
                    <img
                      src={agent.photo}
                      alt={agent.name}
                      className="w-20 h-20 object-cover rounded-full border"
                      onError={(e) => {
                        console.error('Failed to load agent photo:', e.target.src);
                        e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80';
                      }}
                    />
                    <div>
                      <p className="text-stone-700"><strong>Contact:</strong> {agent.contact}</p>
                      <p className="text-stone-700"><strong>Experience:</strong> {agent.experience}</p>
                      <p className="text-stone-700"><strong>Rating:</strong> ⭐ {agent.rating}</p>
                    </div>
                  </div>
                  <div>
                    <strong className="text-stone-700">Properties:</strong>
                    {agentProperties.length > 0 ? (
                      <ul className="list-disc list-inside text-stone-700 mt-2">
                        {agentProperties.map((prop) => (
                          <li key={prop.id}>
                            <Link
                              to={`/listings/${prop.id}`}
                              className="text-stone-700 hover:underline">
                              {prop.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-stone-700 mt-2">No properties listed yet.</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-stone-600 text-lg col-span-full">
              No agents found.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;