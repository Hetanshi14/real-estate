import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";

const PropertyDetails = () => {
  const { developerName } = useParams();
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [developerImage, setDeveloperImage] = useState(null);
  const [developerLogo, setDeveloperLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef([]);

  const defaultImage =
    "https://tse1.mm.bing.net/th?id=OIP.NVfmC91cXZclVmv4ML3-bAHaEK&pid=Api&P=0&h=180";

  const isVisible = (sectionId) => {
    const sectionIndex = sectionRefs.current.findIndex((ref) => ref?.id === sectionId);
    const section = sectionRefs.current[sectionIndex];
    return section
      ? section.getBoundingClientRect().top < window.innerHeight &&
          section.getBoundingClientRect().bottom > 0
      : false;
  };

  useEffect(() => {
    const fetchDeveloperProperties = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from("properties")
          .select(
            `
              id, name, location, price, carpet_area, configuration, property_type, total_floors,
              total_units, status, rera_number, amenities, developer_name, developer_tagline,
              developer_experience, developer_projects_completed, developer_happy_families,
              developer_awards, developer_certifications, developer_description,
              images, developer_image, developer_logo, nearby_landmarks, agent_name, agent_role,
              agent_phone, agent_email, agent_availability, agent_rating, agent_reviews, agents_image
            `
          )
          .eq("developer_name", decodeURIComponent(developerName));

        if (fetchError) {
          throw new Error(`Failed to fetch properties: ${fetchError.message}`);
        }

        if (!data || data.length === 0) {
          setProperties([]);
          setError("No properties found for this developer.");
          return;
        }

        const firstProperty = data[0];
        const devImg =
          firstProperty.developer_image &&
          firstProperty.developer_image.trim() !== ""
            ? firstProperty.developer_image.split(",")[0].trim()
            : null;
        setDeveloperImage(devImg);

        const devLogo =
          firstProperty.developer_logo &&
          firstProperty.developer_logo.trim() !== ""
            ? firstProperty.developer_logo.split(",")[0].trim()
            : null;
        setDeveloperLogo(devLogo);

        const mappedProperties = data.map((p) => ({
          id: p.id,
          name: p.name || "Unnamed Property",
          type: p.property_type || "Unknown",
          bhk: p.configuration ? parseInt(p.configuration) || 0 : 0,
          price: p.price ? parseFloat(p.price) : 0,
          location: p.location || "Unknown",
          status: p.status || "Unknown",
          floors: p.total_floors || "N/A",
          units: p.total_units || "N/A",
          carpetArea: p.carpet_area || 0,
          reraNumber: p.rera_number || "N/A",
          amenities: Array.isArray(p.amenities)
            ? p.amenities
            : p.amenities
            ? p.amenities.split(",")
            : [],
          image:
            p.images && p.images.trim() !== "" ? p.images.split(",")[0] : null,
          developer: p.developer_name || "Unknown Developer",
          tagline: p.developer_tagline || "No tagline",
          experience: p.developer_experience || 0,
          projectsCompleted: p.developer_projects_completed || 0,
          happyFamilies: p.developer_happy_families || 0,
          awards: p.developer_awards || "None",
          certifications: p.developer_certifications || "None",
          description: p.developer_description || "No description available.",
          nearbyLandmarks: p.nearby_landmarks || "N/A",
          agentName: p.agent_name || "N/A",
          agentRole: p.agent_role || "N/A",
          agentPhone: p.agent_phone || "N/A",
          agentEmail: p.agent_email || "N/A",
          agentAvailability: p.agent_availability || "N/A",
          agentRating: p.agent_rating || 0,
          agentReviews: p.agent_reviews || 0,
          agentsImage:
            p.agents_image && p.agents_image.trim() !== ""
              ? p.agents_image.split(",")[0]
              : null,
        }));

        setProperties(mappedProperties);
        setError(null);
      } catch (error) {
        setError(`Failed to load properties: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDeveloperProperties();
  }, [developerName]);

  if (loading)
    return (
      <div className="col-span-full flex justify-center items-center h-64">
        <img
          src="https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/logo/zivaaslogo01.jpg"
          className="h-32 w-auto object-contain animate-pulse"
        />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-4xl mx-auto my-8 text-center shadow-md">
          {error}
        </div>
      )}
      {properties.length > 0 && (
        <div>
          <section
            className="relative"
            ref={(el) => (sectionRefs.current[0] = el)}
          >
            <motion.div
              className="relative h-[12vh] overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-black/60 z-0"></div>
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="px-4 max-w-4xl">
                  <h1 className="text-3xl md:text-4xl font-semibold mb-3">
                    {properties[0].developer}
                  </h1>
                </div>
              </motion.div>
            </motion.div>
          </section>

          <section
            id="details"
            ref={(el) => (sectionRefs.current[1] = el)}
            className="max-w-6xl mx-auto p-6 md:p-8 lg:p-10 my-10 bg-white rounded-lg shadow-lg transition-all duration-1000"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Developer Logo Card */}
              <div className="col-span-1 md:col-span-1">
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-5 w-90 h-70 hover:shadow-lg/20 transition-shadow duration-300">
                  <img
                    src={developerLogo || defaultImage}
                    alt={`${properties[0].developer} Logo`}
                    className="w-90 h-70 object-cover"
                  />
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {properties[0].developer}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {properties[0].tagline}
                    </p>
                  </div>
                </div>
                {/* About Section */}
                <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                  <div className="flex items-center mb-6">
                    {developerImage && (
                      <div className="flex-shrink-0 bg-gray-200 p-2 rounded-md mr-6">
                        <img
                          src={developerImage || defaultImage}
                          alt={`${properties[0].developer} Image`}
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl md:text-2xl font-semibold text-gray-800">
                        About {properties[0].developer}
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">
                        <strong className="text-md font-medium text-gray-800">
                          Experience:
                        </strong>{" "}
                        {properties[0].experience} years
                      </p>
                      <p className="text-gray-600">
                        <strong className="text-md font-medium text-gray-800">
                          Projects Completed:
                        </strong>{" "}
                        {properties[0].projectsCompleted}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <strong className="text-md font-medium text-gray-800">
                          Awards:
                        </strong>{" "}
                        {properties[0].awards}
                      </p>
                      <p className="text-gray-600">
                        <strong className="text-md font-medium text-gray-800">
                          Certifications:
                        </strong>{" "}
                        {properties[0].certifications}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description and Agent Information */}
              <div className="col-span-1 md:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    Agent Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      {properties[0].agentsImage && (
                        <div className="mb-6">
                          <img
                            src={properties[0].agentsImage || defaultImage}
                            alt={`${properties[0].agentName} Image`}
                            className="w-26 h-26 rounded-full object-contain border-2 border-gray-200"
                          />
                        </div>
                      )}
                      <p className="text-gray-600">
                        <strong className="text-md font-medium text-gray-800">
                          Name:
                        </strong>{" "}
                        {properties[0].agentName}
                      </p>
                      <p className="text-gray-600">
                        <strong className="text-md font-medium text-gray-800">
                          Role:
                        </strong>{" "}
                        {properties[0].agentRole}
                      </p>
                      <p className="text-gray-600">
                        <strong className="text-md font-medium text-gray-800">
                          Phone:
                        </strong>{" "}
                        {properties[0].agentPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2">
                        <strong className="text-md font-medium text-gray-800">
                          Email:
                        </strong>{" "}
                        {properties[0].agentEmail}
                      </p>
                      <p className="text-gray-600 mb-2">
                        <strong className="text-md font-medium text-gray-800">
                          Availability:
                        </strong>{" "}
                        {properties[0].agentAvailability}
                      </p>
                      <p className="text-gray-600 mb-2">
                        <strong className="text-md font-medium text-gray-800">
                          Rating:
                        </strong>{" "}
                        <Stack spacing={1} direction="row" alignItems="center">
                          <Rating
                            name={`agent-rating-${properties[0].id}`}
                            value={parseFloat(properties[0].agentRating) || 0}
                            precision={0.5}
                            readOnly
                            size="small"
                          />
                          <span className="ml-2 text-sm text-stone-700">
                            {properties[0].agentRating || 0}/5
                          </span>
                        </Stack>
                      </p>
                      <p className="text-gray-600 mb-2">
                        <strong className="text-md font-medium text-gray-800">
                          Reviews:
                        </strong>{" "}
                        {properties[0].agentReviews}
                      </p>
                      <p className="text-gray-600 mb-2">
                        <strong className="text-md font-medium text-gray-800">
                          Nearby Landmarks:
                        </strong>{" "}
                        {properties[0].nearbyLandmarks}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-6 leading-relaxed">
                    <strong className="text-gray-800">Description:</strong>{" "}
                    {properties[0].description}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Properties Section */}
          <section
            id="properties"
            ref={(el) => (sectionRefs.current[2] = el)}
            className="max-w-6xl mx-auto p-6 md:p-8 lg:p-10 my-10 bg-white rounded-lg shadow-lg"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isVisible("properties") ? 1 : 0, y: isVisible("properties") ? 0 : 30 }}
              transition={{ duration: 0.6 }}
              className="transition-all duration-1000 transform"
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 text-center mb-8">
                Properties by {properties[0].developer}
              </h2>
              {error && (
                <p className="text-stone-600 text-center mb-4">{error}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.length > 0 ? (
                  properties.map((prop) => (
                    <div
                      key={prop.id}
                      className="rounded shadow hover:shadow-lg transition text-white"
                    >
                      <div className="relative group h-[45vh] w-full overflow-hidden rounded">
                        <Link to={`/listings/${prop.id}`}>
                          {prop.image ? (
                            <img
                              src={prop.image}
                              alt={prop.name}
                              className="w-full h-full transition-transform duration-300 group-hover:scale-105 rounded"
                              onError={(e) => {
                                e.target.src = defaultImage;
                                e.target.parentElement.classList.add(
                                  "flex",
                                  "items-center",
                                  "justify-center",
                                  "bg-gray-200"
                                );
                                console.error(
                                  "PropertyDetails: Image load failed:",
                                  prop.image
                                );
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-200 text-stone-700">
                              Image not uploaded
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black opacity-40 md:opacity-0 md:group-hover:opacity-40 transition-opacity duration-300 z-0"></div>
                          <div className="absolute inset-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                            <div className="absolute bottom-4 left-4 text-left">
                              <h3 className="text-lg font-semibold">
                                {prop.name}
                              </h3>
                              <p className="text-sm">{prop.location}</p>
                              <p className="text-sm">
                                {prop.bhk ? `${prop.bhk} BHK • ` : ""}₹
                                {prop.price.toLocaleString()}
                              </p>
                              <p className="text-sm">
                                {prop.type || "Unknown Type"} •{" "}
                                {prop.status || "Unknown Status"}
                              </p>
                              <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Built by: {prop.developer}
                              </p>
                              <div className="mt-1">
                                <Link
                                  to={`/listings/${prop.id}`}
                                  className="underline text-white hover:font-semibold"
                                >
                                  View Details
                                </Link>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-stone-600 text-lg col-span-full">
                    {error || "No properties found for this developer."}
                  </p>
                )}
              </div>
            </motion.div>
          </section>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;