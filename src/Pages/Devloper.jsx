import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { RiFilter2Line, RiBuildingLine } from "react-icons/ri";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";

const Developer = () => {
  const [developers, setDevelopers] = useState([]);
  const [error, setError] = useState(null);
  const [minExperience, setMinExperience] = useState("");
  const [minRating, setMinRating] = useState("");
  const [filteredDevelopers, setFilteredDevelopers] = useState([]);

  const sectionRefs = useRef([]);
  const [visibleSections, setVisibleSections] = useState([]);

  useEffect(() => {
    const fetchDevelopersAndProperties = async () => {
      try {
        console.log("Fetching developers and properties...");
        const { data, error: fetchError } = await supabase.from("properties")
          .select(`
            id,
            name,
            images,
            developer_name,
            developer_description,
            developer_image,
            developer_logo,
            developer_experience,
            developer_rating
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

        // Group properties by developer_name and aggregate experience and rating
        const developerMap = new Map();
        data.forEach((property) => {
          const developerName = property.developer_name;
          if (!developerMap.has(developerName)) {
            const developerLogo =
              property.developer_logo && property.developer_logo.trim() !== ""
                ? property.developer_logo.split(",")[0].trim()
                : null;
            console.log(`Developer ${developerName} logo:`, developerLogo); // Debug logo URL
            developerMap.set(developerName, {
              name: developerName,
              description:
                property.developer_description || "No description available.",
              logo: developerLogo,
              experience: property.developer_experience || 0, // Default to 0 if null
              rating: property.developer_rating || 0.0, // Default to 0.0 if null
              properties: [],
            });
          }
          // Aggregate experience and rating
          const currentDeveloper = developerMap.get(developerName);
          currentDeveloper.experience = Math.max(
            currentDeveloper.experience,
            property.developer_experience || 0
          );
          currentDeveloper.rating = (
            (currentDeveloper.rating * currentDeveloper.properties.length +
              (property.developer_rating || 0.0)) /
            (currentDeveloper.properties.length + 1)
          ).toFixed(1); // Simple average
          currentDeveloper.properties.push({
            id: property.id,
            name: property.name || "Unnamed Property",
            image:
              property.images && property.images.length > 0
                ? property.images.split(",")[0].trim()
                : null,
          });
        });

        const developersArray = Array.from(developerMap.values());
        console.log("Mapped developers:", developersArray);
        setDevelopers(developersArray);
        setFilteredDevelopers(developersArray); // Initialize filtered list
        setError(null);
      } catch (error) {
        console.error("Error in fetchDevelopersAndProperties:", error);
        setError(`Failed to load developers and properties: ${error.message}`);
        setDevelopers([]);
        setFilteredDevelopers([]);
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

  useEffect(() => {
    // Filter developers based on minExperience and minRating
    let updatedDevelopers = [...developers];
    if (minExperience) {
      updatedDevelopers = updatedDevelopers.filter(
        (dev) => dev.experience >= parseInt(minExperience, 10)
      );
    }
    if (minRating) {
      updatedDevelopers = updatedDevelopers.filter(
        (dev) => dev.rating >= parseFloat(minRating)
      );
    }
    setFilteredDevelopers(updatedDevelopers);
  }, [minExperience, minRating, developers]);

  const isVisible = (id) => visibleSections.includes(id);

  const clearFilters = () => {
    setMinExperience("");
    setMinRating("");
  };

  // Default image URL
  const defaultImage =
    "https://tse1.mm.bing.net/th/id/OIP.NVfmC91cXZclVmv4ML3-bAHaEK?pid=Api&P=0&h=180";

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Hero Section */}
      <section
        id="hero"
        ref={(el) => (sectionRefs.current[0] = el)}
        className={`bg-cover bg-center text-white py-40 transition-all duration-1000 transform ${
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-stone-700 tracking-tight flex items-center">
            <RiBuildingLine className="mr-2 text-3xl" /> Our Developers
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-stone-700 font-semibold mr-2 flex items-center">
                Min Experience:
              </label>
              <input
                type="number"
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                placeholder="e.g., 5"
                className="p-2 border border-stone-300 rounded text-sm w-24"
                min="0"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-stone-700 font-semibold mr-2 flex items-center">
                Min Rating:
              </label>
              <input
                type="number"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                placeholder="e.g., 3.0"
                className="p-2 border border-stone-300 rounded text-sm w-24"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
            <button
              onClick={clearFilters}
              className="relative inline-block px-3 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600 
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Selected Filters Section */}
        {(minExperience || minRating) && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-stone-600 mb-2">
              Selected Filters:
            </h4>
            <div className="flex flex-wrap gap-2">
              {minExperience && (
                <span className="bg-stone-100 text-stone-700 px-2 py-1 rounded text-sm">
                  Min Experience: {minExperience} years
                </span>
              )}
              {minRating && (
                <span className="bg-stone-100 text-stone-700 px-2 py-1 rounded text-sm">
                  Min Rating: {minRating}
                </span>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg max-w-2xl mx-auto mb-8 text-center shadow-sm">
            {error}
          </div>
        )}
        {filteredDevelopers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredDevelopers.map((developer) => (
              <div
                key={developer.name}
                className="bg-white border border-gray-100 rounded shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                {/* Developer Logo */}
                <div className="mb-4">
                  <img
                    src={developer.logo || defaultImage}
                    alt={`${developer.name} Logo`}
                    className="w-full h-60 rounded-t opacity-80"
                    onError={(e) => {
                      e.target.src = defaultImage;
                      console.error(
                        `Failed to load logo for ${developer.name}:`,
                        developer.logo
                      );
                    }}
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-center mb-4">
                    <h3 className="text-xl font-semibold text-stone-700">
                      {developer.name}
                    </h3>
                  </div>
                  <p className="text-sm text-stone-700 mb-4 leading-relaxed">
                    <strong className="text-stone-700">Experience:</strong>{" "}
                    {developer.experience || 0}+ years
                  </p>
                  <div className="flex items-center mb-4">
                    <strong className="text-stone-700 mr-2">Rating:</strong>
                    <Stack spacing={1}>
                      <Rating
                        name={`rating-${developer.name}`}
                        value={parseFloat(developer.rating) || 0}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                    </Stack>
                    <span className="ml-2 text-sm text-stone-700">
                      {developer.rating || 0}/5
                    </span>
                  </div>
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
        {filteredDevelopers.length === 0 && !error && (
          <p className="text-center text-stone-700">
            No developers match the filters.
          </p>
        )}
      </section>
    </div>
  );
};

export default Developer;
