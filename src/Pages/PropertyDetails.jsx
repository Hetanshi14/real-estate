import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import {
  RiPhoneLine,
  RiMailLine,
  RiTimeLine,
  RiStarFill,
} from "react-icons/ri";
import { Heart } from "lucide-react";

const PropertyDetails = () => {
  const sectionRefs = useRef([]);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [developerImage, setDeveloperImage] = useState(null);
  const [developerLogo, setDeveloperLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const { developerName } = useParams();

  const defaultImage = "https://via.placeholder.com/300x300?text=No+Image";

  const isVisible = (sectionId) => {
    const sectionIndex = sectionRefs.current.findIndex(
      (ref) => ref?.id === sectionId
    );
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
        const devLogo =
          firstProperty.developer_logo &&
          firstProperty.developer_logo.trim() !== ""
            ? firstProperty.developer_logo.split(",")[0].trim()
            : null;
        setDeveloperImage(devLogo);
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
          isInWishlist: false,
        }));

        setProperties(mappedProperties);
        setError(null);
      } catch (error) {
        setError(`Failed to load properties: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();
          if (userError) {
            console.error(
              "PropertyDetails: Error fetching user data:",
              userError
            );
            setError(`Error fetching user data: ${userError.message}`);
            setUserRole(null);
            return;
          }
          setUserRole(userData.role);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("PropertyDetails: Error fetching user data:", error);
        setError(`Error fetching user data: ${error.message}`);
      }
    };

    fetchDeveloperProperties();
    fetchUserData();
  }, [developerName]);

  useEffect(() => {
    const fetchWishlistStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.role === "developer" || userRole === "developer")
        return;

      const { data: wishlistData, error: wishlistError } = await supabase
        .from("wishlist")
        .select("property_id")
        .eq("user_id", user.id);

      if (wishlistError) {
        console.error(
          "PropertyDetails: Error fetching wishlist:",
          wishlistError
        );
        setError(`Error fetching wishlist: ${wishlistError.message}`);
        return;
      }

      const wishlistIds = wishlistData.map((item) => item.property_id);

      setProperties((prev) =>
        prev.map((prop) => ({
          ...prop,
          isInWishlist: wishlistIds.includes(prop.id),
        }))
      );
    };

    fetchWishlistStatus();
  }, [properties.length, userRole]);

  const toggleWishlist = async (propertyId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.role === "developer" || userRole === "developer") {
      setError("Developers cannot manage wishlist.");
      return;
    }

    try {
      const property = properties.find((p) => p.id === propertyId);
      if (property.isInWishlist) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", propertyId);

        if (error)
          throw new Error(`Failed to remove from wishlist: ${error.message}`);

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
      setError(null);
    } catch (err) {
      console.error("PropertyDetails: Error toggling wishlist:", err);
      setError(err.message);
    }
  };

  if (loading)
    return (
      <div className="col-span-full flex justify-center items-center min-h-screen w-auto h-72">
        <img
          src="https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/logo/zivaaslogo01.jpg"
          className="h-32 w-auto object-contain animate-pulse"
        />
      </div>
    );

  return (
    <div className="bg-gray-50 font-sans text-gray-900">
      {/* Hero Section */}
      <section
        ref={(el) => (sectionRefs.current[0] = el)}
        className="relative h-[400px] bg-cover bg-center transition-all duration-1000 transform"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1496888285926-9266f6d59ddd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-semibold mb-10 animate-slide-up">
              {properties[0]?.developer || "Prestige Group"}
            </h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-20 relative z-20">
        {/* Developer Details */}
        <div
          ref={(el) => (sectionRefs.current[1] = el)}
          className="bg-white rounded-xl shadow-lg p-8 mb-12 animate-slide-up"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-stone-700 text-2xl font-bold">
                    {properties[0]?.developer
                      ?.split(" ")
                      ?.slice(0, 2)
                      ?.map((word) => word[0])
                      ?.join("") || "PG"}
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {properties[0]?.developer || "Prestige Group"}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {properties[0]?.tagline ||
                      "Excellence in Real Estate Development"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">
                    {properties[0]?.experience || 38}+
                  </div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">
                    {properties[0]?.projectsCompleted || 280}+
                  </div>
                  <div className="text-gray-600">Projects Completed</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">
                    {properties[0]?.awards?.length || 45}+
                  </div>
                  <div className="text-gray-600">Awards Won</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">
                    {properties[0].certifications || "N/A"}
                  </div>
                  <div className="text-gray-600">Certified</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-80 h-80 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
                <img
                  src={
                    developerImage ||
                    "https://readdy.ai/api/search-image?query=professional%20corporate%20real%20estate%20developer%20portrait%2C%20modern%20office%20building%20background%2C%20confident%20business%20executive%20in%20formal%20attire%2C%20clean%20professional%20photography%2C%20natural%20lighting&width=400&height=400&seq=dev1&orientation=squarish"
                  }
                  alt={properties[0]?.developer || "Prestige Group"}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Agent Information */}
        <div
          ref={(el) => (sectionRefs.current[2] = el)}
          className="bg-white rounded-xl shadow-lg p-8 mb-12 animate-fade-in"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Agent Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src={
                    properties[0]?.agentsImage ||
                    "https://readdy.ai/api/search-image?query=professional%20real%20estate%20agent%20portrait%2C%20confident%20business%20woman%20in%20formal%20attire%2C%20modern%20office%20background%2C%20clean%20professional%20headshot%2C%20natural%20lighting&width=200&height=200&seq=agent1&orientation=squarish"
                  }
                  alt={properties[0]?.agentName || "Sarah Johnson"}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <h4 className="text-xl font-semibold text-gray-800">
                {properties[0]?.agentName || "Sarah Johnson"}
              </h4>
              <p className="text-gray-600 mb-2">
                {properties[0]?.agentRole || "Senior Sales Manager"}
              </p>
              <div className="flex justify-center items-center mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <RiStarFill key={i} />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  ({properties[0]?.agentRating || 4.9})
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {properties[0]?.agentReviews || 142} Reviews
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center text-primary">
                  <RiPhoneLine />
                </div>
                <span className="text-gray-700">
                  {properties[0]?.agentPhone || "+1 (555) 123-4567"}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center text-primary">
                  <RiMailLine />
                </div>
                <span className="text-gray-700">
                  {properties[0]?.agentEmail || "sarah.johnson@prestige.com"}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center text-primary">
                  <RiTimeLine />
                </div>
                <span className="text-gray-700">
                  {properties[0]?.agentAvailability || "Available 9 AM - 6 PM"}
                </span>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-3">
                Nearby Landmarks
              </h5>
              <div className="flex flex-wrap gap-2">
                {properties[0]?.nearbyLandmarks
                  ?.split(",")
                  ?.map((landmark, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 ${
                        index === 0
                          ? "bg-blue-100 text-stone-800"
                          : index === 1
                          ? "bg-green-100 text-stone-800"
                          : index === 2
                          ? "bg-purple-100 text-stone-800"
                          : "bg-orange-100 text-stone-800"
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

        {/* About Section */}
        <div
          ref={(el) => (sectionRefs.current[3] = el)}
          className="bg-white rounded-xl shadow-lg p-8 mb-12 animate-fade-in"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            About {properties[0]?.developer || "Prestige Group"}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {properties[0]?.description ||
              "Prestige Group is one of South India's leading real estate developers with over three decades of experience in creating exceptional residential and commercial spaces. Founded in 1986, we have consistently delivered projects that combine innovative design, superior quality, and timely completion. Our portfolio spans across luxury apartments, premium villas, commercial complexes, and integrated townships. With a commitment to excellence and customer satisfaction, we have built a reputation for trust and reliability in the real estate industry. Our developments are strategically located in prime areas, offering residents and businesses access to world-class amenities and infrastructure."}
          </p>
        </div>

        {/* Properties Section */}
        <div ref={(el) => (sectionRefs.current[4] = el)} className="mb-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-12 text-center">
            Properties by {properties[0]?.developer || "Prestige Group"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {properties.length > 0 ? (
              properties.map((property, index) => (
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
                              property.image
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
                            {property.name}
                          </h3>
                          <p className="text-sm">{property.location}</p>
                          <p className="text-sm">
                            {property.bhk ? `${property.bhk} BHK • ` : ""}₹
                            {property.price.toLocaleString()}
                          </p>
                          <p className="text-sm">
                            {property.type || "Unknown Type"} •{" "}
                            {property.status || "Unknown Status"}
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
                    {userRole === "customer" &&
                      property.isInWishlist !== undefined && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(property.id);
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white hover:text-red-500"
                          aria-label={
                            property.isInWishlist
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >
                          <Heart
                            className={
                              property.isInWishlist
                                ? "fill-red-500 text-red-500"
                                : ""
                            }
                          />
                        </button>
                      )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-stone-600 text-lg col-span-full">
                {error || "No properties found for this developer."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder function (to be implemented with react-router-dom's useNavigate if needed)
const handleCardClick = (propertyName) => {
  console.log(`Navigating to property: ${propertyName}`);
};

export default PropertyDetails;