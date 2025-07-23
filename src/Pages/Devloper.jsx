import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Developer = () => {
  const [developers, setDevelopers] = useState([]);
  const [error, setError] = useState(null);

  const sectionRefs = useRef([]);
  const [visibleSections, setVisibleSections] = useState([]);

  useEffect(() => {
    const fetchDevelopersAndProperties = async () => {
      try {
        console.log("Fetching developers and properties...");
        const { data, error: fetchError } = await supabase
          .from("properties")
          .select(`
            id, name, images, developer_name, developer_description, developer_image
          `);

        if (fetchError) {
          console.error("Supabase fetch error:", fetchError.message);
          throw new Error(`Supabase error: ${fetchError.message}`);
        }

        console.log("Raw data from Supabase:", data);

        if (!data || data.length === 0) {
          console.warn("No properties found in database");
          setDevelopers([]);
          setError("No developers found. Please try again later.");
          return;
        }

        // Group properties by developer_name
        const developerMap = new Map();
        data.forEach((property) => {
          const developerName = property.developer_name;
          if (!developerMap.has(developerName)) {
            developerMap.set(developerName, {
              name: developerName,
              description:
                property.developer_description || "No description available.",
              image:
                property.developer_image && property.developer_image.trim() !== ""
                  ? property.developer_image
                  : null,
              properties: [],
            });
          }
          developerMap.get(developerName).properties.push({
            id: property.id,
            name: property.name || "Unnamed Property",
            image:
              property.images && property.images.length > 0
                ? property.images[0] || null
                : null,
          });
        });

        const developersArray = Array.from(developerMap.values());
        console.log("Mapped developers:", developersArray);
        setDevelopers(developersArray);
        setError(null);
      } catch (error) {
        console.error("Error in fetchDevelopersAndProperties:", error);
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
          if (
            entry.isIntersecting &&
            !visibleSections.includes(entry.target.id)
          ) {
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

  // Default image URL
  const defaultImage = "https://tse1.mm.bing.net/th/id/OIP.NVfmC91cXZclVmv4ML3-bAHaEK?pid=Api&P=0&h=180";

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Hero Section */}
      <section
        id="hero"
        ref={(el) => (sectionRefs.current[0] = el)}
        className={`bg-cover bg-center text-white py-48 transition-all duration-1000 transform ${
          isVisible("hero")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
        style={{
          backgroundImage: `url(https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Bg%20img/bgdev.jpg)`,
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-3">
            Discover Premium Properties
          </h2>
          <p className="text-base mb-5 max-w-xl mx-auto">
            Explore a world of innovative and sustainable real estate solutions
            from our top developers.
          </p>
          <a
            href="#developers"
            className="relative inline-block px-5 py-2 rounded-md font-medium text-stone-700 bg-white z-10 overflow-hidden
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600 
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
          >
            Explore Now
          </a>
        </div>
      </section>

      {/* Developers Section */}
      <section
        id="developers"
        ref={(el) => (sectionRefs.current[1] = el)}
        className={`max-w-7xl mx-auto py-12 px-4 transition-all duration-1000 transform ${
          isVisible("developers")
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
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
                className="bg-white border border-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                {/* Developer Image */}
                <div className="mb-4">
                  <img
                    src={developer.image || defaultImage}
                    alt={`${developer.name} logo`}
                    className="w-full h-48 object-cover rounded-md opacity-80"
                    onError={(e) => {
                      e.target.src = defaultImage;
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {developer.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    <strong className="text-gray-900">Description:</strong>{" "}
                    {developer.description}
                  </p>
                  <Link
                    to={`/properties/developer/${encodeURIComponent(
                      developer.name
                    )}`}
                    className="relative inline-block font-medium text-stone-700 text-sm after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-full after:bg-stone-700 hover:font-bold"
                  >
                    View All
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Developer;