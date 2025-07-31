import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { RiFilter2Line, RiBuildingLine } from "react-icons/ri";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import { motion } from "framer-motion";

// Default image URL
const DEFAULT_IMAGE = "https://tse1.mm.bing.net/th/id/OIP.NVfmC91cXZclVmv4ML3-bAHaEK?pid=Api&P=0&h=180";

// Logo URL
const LOGO_URL = "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/logo/zivaaslogo01.jpg";

const Developer = () => {
  const [developers, setDevelopers] = useState([]);
  const [error, setError] = useState(null);
  const [minExperience, setMinExperience] = useState("");
  const [minRating, setMinRating] = useState("");
  const [filteredDevelopers, setFilteredDevelopers] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // New loading state

  const sectionRefs = useRef([]);
  const [visibleSections, setVisibleSections] = useState(["hero", "developers"]); // Initialize with sections visible

  useEffect(() => {
    const fetchDevelopersAndProperties = async () => {
      try {
        setIsLoading(true); // Start loading
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
              experience: property.developer_experience || 0,
              rating: property.developer_rating || 0.0,
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
          ).toFixed(1);
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
        setFilteredDevelopers(developersArray);
        setError(null);
      } catch (error) {
        console.error("Error in fetchDevelopersAndProperties:", error);
        setError(`Failed to load developers and properties: ${error.message}`);
        setDevelopers([]);
        setFilteredDevelopers([]);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchDevelopersAndProperties();
  }, []);

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

  const clearFilters = () => {
    setMinExperience("");
    setMinRating("");
  };

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
      {/* Hero Section */}
      <section
        id="hero"
        ref={(el) => (sectionRefs.current[0] = el)}
        className="relative bg-cover bg-center text-white py-24 transition-all duration-1000"
        style={{
          backgroundImage: `url(https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Bg%20img/bgdev.jpg)`,
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="container mx-auto px-6 text-center relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Discover Premium Properties
          </h1>
          <p className="text-lg mb-6 text-gray-200">
            Explore a world of innovative and sustainable real estate solutions
            from our top developers.
          </p>
          <a
            href="#developers"
            className="relative inline-block px-6 py-3 rounded-lg font-semibold text-gray-900 bg-white shadow-md hover:bg-gray-100 transition-colors duration-300"
          >
            Explore Now
          </a>
        </div>
      </section>

      {/* Developers Section */}
      <section
        id="developers"
        ref={(el) => (sectionRefs.current[1] = el)}
        className="max-w-7xl mx-auto py-16 px-6 transition-all duration-1000"
      >
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight flex items-center">
            <RiBuildingLine className="mr-3 text-4xl" /> Our Developers
          </h2>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <label className="text-base font-medium text-gray-700">
                Min Experience:
              </label>
              <input
                type="number"
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                placeholder="e.g., 5"
                className="p-2 border border-gray-300 rounded-lg text-sm w-28 focus:ring-none focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-base font-medium text-gray-700">
                Min Rating:
              </label>
              <input
                type="number"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                placeholder="e.g., 3.0"
                className="p-2 border border-gray-300 rounded-lg text-sm w-28 focus:ring-none focus:ring-blue-500 focus:border-transparent"
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
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-600 mb-3">
              Selected Filters:
            </h4>
            <div className="flex flex-wrap gap-3">
              {minExperience && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  Min Experience: {minExperience} years
                </span>
              )}
              {minRating && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  Min Rating: {minRating}
                </span>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-3xl mx-auto mb-10 text-center shadow-lg">
            {error}
          </div>
        )}
        {filteredDevelopers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDevelopers.map((developer) => (
              <div
                key={developer.name}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Developer Logo */}
                <div className="mb-2 overflow-hidden">
                  <img
                    src={developer.logo || DEFAULT_IMAGE}
                    alt={`${developer.name} Logo`}
                    className="w-full h-64 rounded-t-lg object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGE;
                      console.error(
                        `Failed to load logo for ${developer.name}:`,
                        developer.logo
                      );
                    }}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {developer.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    <strong className="text-gray-800">Experience:</strong>{" "}
                    {developer.experience || 0}+ years
                  </p>
                  <div className="flex items-center mb-3">
                    <strong className="text-gray-800 mr-2">Rating:</strong>
                    <Stack spacing={1}>
                      <Rating
                        name={`rating-${developer.name}`}
                        value={parseFloat(developer.rating) || 0}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                    </Stack>
                    <span className="ml-2 text-sm text-gray-600">
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
          <p className="text-center text-gray-700 text-lg">
            No developers match the filters.
          </p>
        )}
      </section>
    </div>
  );
};

export default Developer;