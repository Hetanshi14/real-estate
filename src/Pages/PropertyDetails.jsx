import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const PropertyDetails = () => {
  const { developerName } = useParams();
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [developerImage, setDeveloperImage] = useState(null);
  const [developerLogo, setDeveloperLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef([]);

  // Default image URL
  const defaultImage =
    "https://tse1.mm.bing.net/th?id=OIP.NVfmC91cXZclVmv4ML3-bAHaEK&pid=Api&P=0&h=180";

  // Placeholder isVisible function
  const isVisible = (sectionId) => {
    const section = sectionRefs.current.find((ref, index) => index === 0);
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
          firstProperty.developer_image && firstProperty.developer_image.trim() !== ""
            ? firstProperty.developer_image.split(',')[0].trim()
            : null;
        setDeveloperImage(devImg);

        const devLogo =
          firstProperty.developer_logo && firstProperty.developer_logo.trim() !== ""
            ? firstProperty.developer_logo.split(',')[0].trim()
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
          image: p.images && p.images.trim() !== "" ? p.images.split(",")[0] : null,
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
          agentsImage: p.agents_image && p.agents_image.trim() !== "" ? p.agents_image.split(',')[0] : null,
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

  if (loading) return <div className="text-center py-12 text-gray-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-4xl mx-auto my-8 text-center shadow-md">
          {error}
        </div>
      )}
      {properties.length > 0 && (
        <div>
          {/* Hero Section with Developer Logo */}
          <section
            id="hero"
            ref={(el) => (sectionRefs.current[0] = el)}
            className={`relative bg-center text-white h-[80vh] bg-no-repeat bg-contain flex items-center justify-center transition-all duration-1000 ${
              isVisible("hero") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              backgroundImage: `url(${developerLogo || defaultImage})`
            }}
          >
            <div className="absolute inset-0 bg-black/50 z-0" />
            <div className="relative z-10 text-center px-4 max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {properties[0].developer}
              </h1>
              <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto drop-shadow-md">
                {properties[0].tagline || "No tagline available"}
              </p>
            </div>
          </section>

          {/* Developer Details Section */}
          <section
            id="details"
            ref={(el) => (sectionRefs.current[1] = el)}
            className="max-w-6xl mx-auto p-6 md:p-8 lg:p-10 my-10 bg-white rounded-lg shadow-lg transition-all duration-1000"
          >
            <div className="flex items-center mb-6">
              {developerImage && (
                <img
                  src={developerImage.split(',')[0] || defaultImage}
                  alt={`${properties[0].developer} Image`}
                  className="w-30 h-30 rounded-full object-cover border-2 border-gray-200 mr-6"
                />
              )}
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
                  About {properties[0].developer}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-800">Experience:</strong>{" "}
                  {properties[0].experience} years
                </p>
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-800">Projects Completed:</strong>{" "}
                  {properties[0].projectsCompleted}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-800">Happy Families:</strong>{" "}
                  {properties[0].happyFamilies}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-800">Awards:</strong>{" "}
                  {properties[0].awards}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-800">Certifications:</strong>{" "}
                  {properties[0].certifications}
                </p>
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              <strong className="text-gray-800">Description:</strong>{" "}
              {properties[0].description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-800">Nearby Landmarks:</strong>{" "}
                  {properties[0].nearbyLandmarks}
                </p>
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
              Agent Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-0 mb-6">
              {properties[0].agentsImage && (
              <div className="mb-6">
                <img
                  src={properties[0].agentsImage || defaultImage}
                  alt={`${properties[0].agentName} Image`}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              </div>
            )}
              <div>
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-800">Name:</strong>{" "}
                  {properties[0].agentName}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-800">Role:</strong>{" "}
                  {properties[0].agentRole}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-800">Phone:</strong>{" "}
                  {properties[0].agentPhone}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-800">Email:</strong>{" "}
                  {properties[0].agentEmail}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-800">Availability:</strong>{" "}
                  {properties[0].agentAvailability}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-800">Rating:</strong>{" "}
                  {properties[0].agentRating} / 5
                </p>
                <p className="text-gray-600 mb-2">
                  <strong className="text-gray-800">Reviews:</strong>{" "}
                  {properties[0].agentReviews}
                </p>
              </div>
            </div>
          </section>

          {/* Properties Section */}
          <section
            id="properties"
            className="max-w-6xl mx-auto p-6 md:p-8 lg:p-10 my-10 bg-white rounded-lg shadow-lg"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 text-center mb-8">
              Properties by {properties[0].developer}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-4">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                      {prop.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      <strong>Location:</strong> {prop.location}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      <strong>BHK:</strong> {prop.bhk ? `${prop.bhk} BHK` : "N/A"}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      <strong>Price:</strong> ₹{prop.price.toLocaleString()}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      <strong>Type:</strong> {prop.type}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      <strong>Status:</strong> {prop.status}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      <strong>Carpet Area:</strong> {prop.carpetArea} sq.ft.
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      <strong>Floors:</strong> {prop.floors}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      <strong>Units:</strong> {prop.units}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      <strong>RERA Number:</strong> {prop.reraNumber}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      <strong>Amenities:</strong> {prop.amenities.join(", ") || "N/A"}
                    </p>
                    <Link
                      to={`/listings/${prop.id}`}
                      className="inline-block mt-4 py-2 text-stone-700 underline hover:font-semibold rounded-md transition-colors duration-300 text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;