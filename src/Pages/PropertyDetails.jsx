import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import { RiPhoneLine, RiMailLine, RiTimeLine, RiStarFill } from "react-icons/ri";
import { Heart } from "lucide-react";

const PropertyDetails = () => {
  const sectionRefs = useRef([]);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [developerLogo, setDeveloperLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const { developerName } = useParams();

  const defaultImage = "https://via.placeholder.com/300x300?text=No+Image";

  // Check if a section is visible in the viewport
  const isVisible = (sectionId) => {
    const section = sectionRefs.current.find((ref) => ref?.id === sectionId);
    if (!section) return false;
    const rect = section.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Validate developerName
        if (!developerName) {
          throw new Error("Developer name is missing.");
        }

        // Fetch user data
        const {
          data: { user },
        } = await supabase.auth.getUser();
        let userId = null;
        let userRole = null;
        if (user) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, role")
            .eq("id", user.id)
            .single();
          if (userError) {
            console.error("Error fetching user data:", userError);
            setError(`Error fetching user data: ${userError.message}`);
          } else {
            userId = userData.id;
            userRole = userData.role;
            setUserRole(userRole);
          }
        }

        // Fetch properties
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
          setLoading(false);
          return;
        }

        // Fetch wishlist data if user is a customer
        let wishlistIds = [];
        if (userId && userRole === "customer") {
          const { data: wishlistData, error: wishlistError } = await supabase
            .from("wishlist")
            .select("property_id")
            .eq("user_id", userId);
          if (wishlistError) {
            console.error("Error fetching wishlist:", wishlistError);
            setError(`Error fetching wishlist: ${wishlistError.message}`);
          } else {
            wishlistIds = wishlistData.map((item) => item.property_id);
          }
        }

        // Map properties
        const mappedProperties = data.map((p) => ({
          id: p.id,
          name: p.name || "Unnamed Property",
          type: p.property_type || "Unknown",
          bhk: p.configuration ? parseInt(p.configuration) || 0 : 0,
          price: p.price ? parseFloat(p.price) : 0,
          location: p.location || "Unknown",
          status: p.status || "Unknown",
          floors: p.total_floors || 0,
          units: p.total_units || 0,
          carpetArea: p.carpet_area || 0,
          reraNumber: p.rera_number || "N/A",
          amenities: Array.isArray(p.amenities) ? p.amenities : [],
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
          agentsImage: Array.isArray(p.agents_image) && p.agents_image.length > 0 ? p.agents_image[0] : null,
          isInWishlist: wishlistIds.includes(p.id),
        }));

        // Set developer logo
        const firstProperty = data[0];
        setDeveloperLogo(
          firstProperty.developer_logo && firstProperty.developer_logo.trim() !== ""
            ? firstProperty.developer_logo
            : null
        );

        setProperties(mappedProperties);
      } catch (error) {
        console.error("Error in fetchData:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [developerName]);

  const toggleWishlist = async (propertyId) => {
    if (userRole !== "customer") {
      setError("Only customers can manage wishlists.");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please log in to manage your wishlist.");
        return;
      }

      const property = properties.find((p) => p.id === propertyId);
      if (!property) return;

      if (property.isInWishlist) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", propertyId);
        if (error) throw new Error(`Failed to remove from wishlist: ${error.message}`);
        setProperties((prev) =>
          prev.map((prop) =>
            prop.id === propertyId ? { ...prop, isInWishlist: false } : prop
          )
        );
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({ user_id: user.id, property_id: propertyId });
        if (error) {
          if (error.code === "23505") {
            setError("This property is already in your wishlist.");
          } else {
            throw new Error(`Failed to add to wishlist: ${error.message}`);
          }
        } else {
          setProperties((prev) =>
            prev.map((prop) =>
              prop.id === propertyId ? { ...prop, isInWishlist: true } : prop
            )
          );
        }
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="col-span-full flex justify-center items-center min-h-screen">
        <img
          src="https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/logo/zivaaslogo01.jpg"
          className="h-32 w-auto object-contain animate-pulse"
          alt="Loading"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-sans text-gray-900">
      {/* Hero Section */}
      <section
        ref={(el) => (sectionRefs.current[0] = { ...el, id: "hero" })}
        className="relative h-[400px] bg-cover bg-center transition-all duration-1000 transform"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1496888285926-9266f6d59ddd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-semibold mb-10 animate-slide-up">
              {properties[0]?.developer || "Developer"}
            </h1>
          </div>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        {/* Developer Details */}
        {properties.length > 0 && (
          <div
            ref={(el) => (sectionRefs.current[1] = { ...el, id: "developer" })}
            className="bg-white rounded-xl shadow-lg p-8 mb-12 animate-slide-up"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-stone-700 text-2xl font-bold">
                      {properties[0].developer
                        ?.split(" ")
                        ?.slice(0, 2)
                        ?.map((word) => word[0])
                        ?.join("") || "N/A"}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {properties[0].developer}
                    </h2>
                    <p className="text-gray-600 text-lg">{properties[0].tagline}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{properties[0].experience}+</div>
                    <div className="text-gray-600">Years Experience</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{properties[0].projectsCompleted}+</div>
                    <div className="text-gray-600">Projects Completed</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">{properties[0].awards || "N/A"}</div>
                    <div className="text-gray-600">Awards Won</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">{properties[0].certifications}</div>
                    <div className="text-gray-600">Certified</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-80 h-80 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
                  <img
                    src={
                      developerLogo 
                    }
                    alt={properties[0].developer}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => (e.target.src = defaultImage)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agent Information */}
        {properties.length > 0 && (
          <div
            ref={(el) => (sectionRefs.current[2] = { ...el, id: "agent" })}
            className="bg-white rounded-xl shadow-lg p-8 mb-12 animate-fade-in"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Agent Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src={
                      properties[0].agentsImage ||
                      "https://readdy.ai/api/search-image?query=professional%20real%20estate%20agent%20portrait%2C%20confident%20business%20woman%20in%20formal%20attire%2C%20modern%20office%20background%2C%20clean%20professional%20headshot%2C%20natural%20lighting&width=200&height=200&seq=agent1&orientation=squarish"
                    }
                    alt={properties[0].agentName}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => (e.target.src = defaultImage)}
                  />
                </div>
                <h4 className="text-xl font-semibold text-gray-800">{properties[0].agentName}</h4>
                <p className="text-gray-600 mb-2">{properties[0].agentRole}</p>
                <div className="flex justify-center items-center mb-2">
                  <Rating value={properties[0].agentRating} readOnly precision={0.1} />
                  <span className="ml-2 text-gray-600">({properties[0].agentRating})</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{properties[0].agentReviews} Reviews</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center text-primary">
                    <RiPhoneLine />
                  </div>
                  <span className="text-gray-700">{properties[0].agentPhone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center text-primary">
                    <RiMailLine />
                  </div>
                  <span className="text-gray-700">{properties[0].agentEmail}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center text-primary">
                    <RiTimeLine />
                  </div>
                  <span className="text-gray-700">{properties[0].agentAvailability}</span>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 mb-3">Nearby Landmarks</h5>
                <div className="flex flex-wrap gap-2">
                  {properties[0].nearbyLandmarks
                    ?.split(",")
                    ?.map((landmark, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 ${
                          index % 4 === 0
                            ? "bg-blue-100 text-blue-800"
                            : index % 4 === 1
                            ? "bg-green-100 text-green-800"
                            : index % 4 === 2
                            ? "bg-purple-100 text-purple-800"
                            : "bg-orange-100 text-orange-800"
                        } rounded-full text-sm`}
                      >
                        {landmark.trim()}
                      </span>
                    )) || (
                    <>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        Metro Station
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Shopping Mall
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        Hospital
                      </span>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        School
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        {properties.length > 0 && (
          <div
            ref={(el) => (sectionRefs.current[3] = { ...el, id: "about" })}
            className="bg-white rounded-xl shadow-lg p-8 mb-12 animate-fade-in"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              About {properties[0].developer}
            </h3>
            <p className="text-gray-600 leading-relaxed">{properties[0].description}</p>
          </div>
        )}

        {/* Properties Section */}
        <div ref={(el) => (sectionRefs.current[4] = { ...el, id: "properties" })} className="p-9">
          <h3 className="text-3xl font-bold text-gray-800 mb-12 text-center">
            Properties by {properties[0]?.developer || "Developer"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {properties.length > 0 ? (
              properties.map((property) => (
                <div
                  key={property.id}
                  className="rounded shadow hover:shadow-lg transition text-white"
                >
                  <div className="relative group h-[300px] w-full overflow-hidden rounded">
                    <Link to={`/listings/${property.id}`}>
                      {property.image ? (
                        <img
                          src={property.image}
                          alt={property.name}
                          className="w-full h-full transition-transform duration-300 group-hover:scale-105 rounded"
                          onError={(e) => (e.target.src = defaultImage)}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-200 text-stone-700">
                          Image not uploaded
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black opacity-40 md:opacity-0 md:group-hover:opacity-40 transition-opacity duration-300 z-0"></div>
                      <div className="absolute inset-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                        <div className="absolute bottom-4 left-4 text-left">
                          <h3 className="text-lg font-semibold">{property.name}</h3>
                          <p className="text-sm">{property.location}</p>
                          <p className="text-sm">
                            {property.bhk ? `${property.bhk} BHK • ` : ""}₹
                            {property.price.toLocaleString()}
                          </p>
                          <p className="text-sm">
                            {property.type} • {property.status}
                          </p>
                          <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Built by: {property.developer}
                          </p>
                          <div className="mt-1">
                            <Link
                              to={`/listings/${property.id}`}
                              className="underline text-white hover:font-semibold"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Link>
                    {userRole === "customer" && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(property.id);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white hover:text-red-500"
                        aria-label={property.isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          className={property.isInWishlist ? "fill-red-500 text-red-500" : ""}
                        />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-stone-600 text-lg col-span-full">
                No properties found for this developer.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;