import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import {
  FaUser,
  FaHeart,
  FaTrash,
  FaEdit,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaPlus,
} from "react-icons/fa";

// Fallback placeholder image URL
const PLACEHOLDER_IMAGE_URL = "https://via.placeholder.com/300?text=No+Image";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistCriteria, setWishlistCriteria] = useState({
    location: "",
    price: "",
    area: "",
    property_type: "",
    status: "",
  });
  const [newProperty, setNewProperty] = useState({
    name: "",
    location: "",
    price: "",
    carpet_area: "",
    configuration: "",
    property_type: "",
    total_floors: "",
    total_units: "",
    status: "",
    rera_number: "",
    amenities: [],
    developer_name: "",
    developer_tagline: "",
    developer_experience: "",
    developer_projects_completed: "",
    developer_happy_families: "",
    nearby_landmarks: "",
    agent_name: "",
    agent_role: "",
    agent_phone: "",
    agent_email: "",
    agent_availability: "",
    agent_rating: "",
    agent_reviews: "",
    images: "",
    agents_image: "",
    developer_image: "",
    developer_awards: "",
    developer_certifications: "",
    developer_description: "",
    developer_logo: "",
  });
  const [editProperty, setEditProperty] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImages, setPreviewImages] = useState({
    developer_logo: [],
    developer_image: [],
    images: [],
    agents_image: [],
  });
  const navigate = useNavigate();
  const location = useLocation();

  const requiredFields = [
    "name",
    "location",
    "price",
    "carpet_area",
    "configuration",
    "property_type",
    "total_floors",
    "total_units",
    "status",
    "rera_number",
    "amenities",
    "developer_name",
    "nearby_landmarks",
  ];

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        setLoading(true);
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        console.log("Profile: Session:", session);
        if (sessionError)
          throw new Error(`Session error: ${sessionError.message}`);
        if (!session) {
          console.log("Profile: No session, redirecting to login");
          navigate("/login", { state: { from: location.pathname } });
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select(
            "id, username, email, role, wishlist_criteria, developer_logo, developer_image"
          )
          .eq("id", session.user.id)
          .single();

        if (userError || !userData) {
          throw new Error(
            userError
              ? `Failed to fetch user: ${userError.message}`
              : "User data not found"
          );
        }

        setUser(userData);
        setPreviewImages((prev) => ({
          ...prev,
          developer_logo: userData.developer_logo
            ? userData.developer_logo.split(",").filter((url) => url.trim())
            : [],
          developer_image: userData.developer_image
            ? userData.developer_image.split(",").filter((url) => url.trim())
            : [],
        }));
        setWishlistCriteria(
          userData.wishlist_criteria || {
            location: "",
            price: "",
            area: "",
            property_type: "",
            status: "",
          }
        );

        if (userData.role === "developer") {
          const { data: propertiesData, error: propertiesError } =
            await supabase
              .from("properties")
              .select(
                "*, developer_experience, developer_projects_completed, developer_awards, developer_certifications, developer_description"
              )
              .eq("developer_id", userData.id)
              .order("updated_at", { ascending: false });

          if (propertiesError)
            throw new Error(
              `Failed to fetch properties: ${propertiesError.message}`
            );
          setProperties(propertiesData || []);
          if (propertiesData && propertiesData.length > 0) {
            setEditProfile((prev) => ({
              ...prev,
              developer_experience:
                propertiesData[0].developer_experience || "",
              developer_projects_completed:
                propertiesData[0].developer_projects_completed || "",
              developer_awards: propertiesData[0].developer_awards || "",
              developer_certifications:
                propertiesData[0].developer_certifications || "",
              developer_description: propertiesData[0].developer_description || "",
              property_id: propertiesData[0].id,
            }));
          }
        } else {
          const { data: wishlistData, error: wishlistError } = await supabase
            .from("wishlist")
            .select(
              "property_id, properties (id, name, location, price, property_type, images, status, carpet_area)"
            )
            .eq("user_id", userData.id);

          if (wishlistError)
            throw new Error(
              `Failed to fetch wishlist: ${wishlistError.message}`
            );
          setWishlist(wishlistData || []);
        }
      } catch (err) {
        console.error("Profile: Error in checkAuthAndFetch:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Profile: Auth state changed:", event, session);
        if (event === "SIGNED_IN" && session) {
          checkAuthAndFetch();
        } else if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          setProperties([]);
          setWishlist([]);
          setPreviewImages({
            developer_logo: [],
            developer_image: [],
            images: [],
            agents_image: [],
          });
          navigate("/login", { state: { from: location.pathname } });
        }
      }
    );

    return () => authListener?.subscription?.unsubscribe?.();
  }, [navigate, location.pathname]);

  const handlePropertyChange = (e) => {
    const { name, value } = e.target;
    if (editProperty) {
      setEditProperty((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewProperty((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenitiesChange = (e) => {
    const { value, checked } = e.target;
    if (editProperty) {
      setEditProperty((prev) => ({
        ...prev,
        amenities: checked
          ? [...prev.amenities, value]
          : prev.amenities.filter((a) => a !== value),
      }));
    } else {
      setNewProperty((prev) => ({
        ...prev,
        amenities: checked
          ? [...prev.amenities, value]
          : prev.amenities.filter((a) => a !== value),
      }));
    }
  };

  const handleImageUpload = async (e, field) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setError(`No files selected for ${field}.`);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Please log in to upload images.");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB limit
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError(`Only image files are allowed for ${field}.`);
        return;
      }
      if (file.size > maxSize) {
        setError(`File size exceeds 5MB limit for ${field}.`);
        return;
      }
    }

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${field}_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError)
          throw new Error(`Failed to upload ${field}: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(fileName);
        if (!urlData.publicUrl)
          throw new Error(`Failed to retrieve public URL for ${field}`);

        return urlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setPreviewImages((prev) => ({
        ...prev,
        [field]: [...prev[field], ...uploadedUrls],
      }));

      if (field === "developer_logo" || field === "developer_image") {
        const existingUrls = user[field]
          ? user[field].split(",").filter((url) => url.trim())
          : [];
        const updatedUrls = [...existingUrls, ...uploadedUrls].join(",");
        const { error } = await supabase
          .from("users")
          .update({ [field]: updatedUrls })
          .eq("id", user.id);

        if (error)
          throw new Error(`Failed to update ${field}: ${error.message}`);

        setUser((prev) => ({ ...prev, [field]: updatedUrls }));
        setEditProfile((prev) => ({ ...prev, [field]: updatedUrls }));
        setSuccessMessage(`Successfully uploaded ${field}!`);
      } else if (editProperty) {
        setEditProperty((prev) => ({
          ...prev,
          [field]: prev[field]
            ? `${prev[field]},${uploadedUrls.join(",")}`
            : uploadedUrls.join(","),
        }));
      } else {
        setNewProperty((prev) => ({
          ...prev,
          [field]: prev[field]
            ? `${prev[field]},${uploadedUrls.join(",")}`
            : uploadedUrls.join(","),
        }));
      }
      setError(null);
    } catch (err) {
      console.error("Profile: Error in handleImageUpload:", err);
      setError(
        `Failed to upload ${field}: ${err.message.includes("unique")
          ? "RERA number already exists."
          : err.message
        }. Please try again.`
      );
    }
  };

  const handleClearImage = async (field, propertyId = null) => {
    try {
      if (field === "developer_logo" || field === "developer_image") {
        const { error } = await supabase
          .from("users")
          .update({ [field]: null })
          .eq("id", user.id);

        if (error)
          throw new Error(`Failed to clear ${field}: ${error.message}`);

        setUser((prev) => ({ ...prev, [field]: null }));
        setEditProfile((prev) => ({ ...prev, [field]: null }));
        setPreviewImages((prev) => ({
          ...prev,
          [field]: [],
        }));
      } else if (propertyId && editProperty) {
        const { error } = await supabase
          .from("properties")
          .update({ [field]: null })
          .eq("id", propertyId);

        if (error)
          throw new Error(`Failed to clear ${field}: ${error.message}`);

        setEditProperty((prev) => ({ ...prev, [field]: null }));
        setPreviewImages((prev) => ({
          ...prev,
          [field]: [],
        }));
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? { ...p, [field]: null } : p))
        );
      } else {
        setNewProperty((prev) => ({ ...prev, [field]: null }));
        setPreviewImages((prev) => ({
          ...prev,
          [field]: [],
        }));
      }
      setSuccessMessage(`Successfully cleared ${field}!`);
      setError(null);
    } catch (err) {
      console.error("Profile: Error in handleClearImage:", err);
      setError(`Failed to clear ${field}: ${err.message}`);
    }
  };

  const handleAddProperty = useCallback(
    async (e) => {
      e.preventDefault();
      if (!user) {
        setError("You must be logged in to add a property.");
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      try {
        const propertyData = {
          ...newProperty,
          price: parseFloat(newProperty.price) || 0,
          carpet_area: parseInt(newProperty.carpet_area) || 0,
          total_floors: parseInt(newProperty.total_floors) || 0,
          total_units: parseInt(newProperty.total_units) || 0,
          developer_experience:
            parseInt(newProperty.developer_experience) || null,
          developer_projects_completed:
            parseInt(newProperty.developer_projects_completed) || null,
          developer_happy_families:
            parseInt(newProperty.developer_happy_families) || null,
          agent_rating: parseFloat(newProperty.agent_rating) || null,
          agent_reviews: parseInt(newProperty.agent_reviews) || null,
          nearby_landmarks: newProperty.nearby_landmarks || "",
          developer_id: user.id,
          images: newProperty.images || "",
          agents_image: newProperty.agents_image || "",
          developer_image: newProperty.developer_image || "",
          developer_logo: newProperty.developer_logo || "",
          developer_description: newProperty.developer_description || "",
        };

        const missingFields = requiredFields.filter(
          (field) => !propertyData[field] && propertyData[field] !== 0
        );
        if (missingFields.length > 0)
          throw new Error(
            `Missing required fields: ${missingFields.join(", ")}`
          );

        const { data, error } = await supabase
          .from("properties")
          .insert([propertyData])
          .select("*");
        if (error)
          throw new Error(
            `Failed to add property: ${error.message.includes("unique")
              ? "RERA number already exists."
              : error.message
            }`
          );

        setProperties((prev) => [...prev, data[0]]);
        setNewProperty({
          name: "",
          location: "",
          price: "",
          carpet_area: "",
          configuration: "",
          property_type: "",
          total_floors: "",
          total_units: "",
          status: "",
          rera_number: "",
          amenities: [],
          developer_name: "",
          developer_tagline: "",
          developer_experience: "",
          developer_projects_completed: "",
          developer_happy_families: "",
          nearby_landmarks: "",
          agent_name: "",
          agent_role: "",
          agent_phone: "",
          agent_email: "",
          agent_availability: "",
          agent_rating: "",
          agent_reviews: "",
          images: "",
          agents_image: "",
          developer_image: "",
          developer_awards: "",
          developer_certifications: "",
          developer_description: "",
          developer_logo: "",
        });
        setPreviewImages((prev) => ({
          ...prev,
          images: [],
          agents_image: [],
          developer_image: [],
          developer_logo: [],
        }));
        setShowAddForm(false);
        setSuccessMessage("Property added successfully!");
        setError(null);
      } catch (err) {
        console.error("Profile: Error in handleAddProperty:", err);
        setError(err.message);
      }
    },
    [user, newProperty, navigate, location.pathname]
  );

  const [editProfile, setEditProfile] = useState({
    username: "",
    email: "",
    developer_experience: "",
    developer_projects_completed: "",
    developer_awards: "",
    developer_certifications: "",
    developer_description: "",
    developer_image: "",
    developer_logo: "",
    property_id: null,
  });

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      // Validate inputs
      if (!editProfile.username.trim()) {
        throw new Error("Username is required.");
      }
      if (!editProfile.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
        throw new Error("Invalid email format.");
      }
      if (
        editProfile.developer_description &&
        editProfile.developer_description.length > 1000
      ) {
        throw new Error("Developer description cannot exceed 1000 characters.");
      }

      // Update user data
      const userUpdates = {
        username: editProfile.username,
        email: editProfile.email,
        developer_image:
          previewImages.developer_image[0] || user.developer_image || null,
        developer_logo:
          previewImages.developer_logo[0] || user.developer_logo || null,
      };

      const { error: userError } = await supabase
        .from("users")
        .update(userUpdates)
        .eq("id", user.id);

      if (userError) throw userError;

      // Update auth email if changed
      if (editProfile.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: editProfile.email,
        });
        if (authError) throw authError;
      }

      // Update property data if a property is selected
      if (editProfile.property_id) {
        const propertyUpdates = {
          developer_experience: parseInt(editProfile.developer_experience) || null,
          developer_projects_completed:
            parseInt(editProfile.developer_projects_completed) || null,
          developer_awards: editProfile.developer_awards || null,
          developer_certifications: editProfile.developer_certifications || null,
          developer_description: editProfile.developer_description || null,
        };

        const { error: propertyError } = await supabase
          .from("properties")
          .update(propertyUpdates)
          .eq("id", editProfile.property_id);

        if (propertyError) throw propertyError;

        // Update local properties state
        setProperties((prev) =>
          prev.map((p) =>
            p.id === editProfile.property_id ? { ...p, ...propertyUpdates } : p
          )
        );
      }

      // Update local user state
      setUser((prev) => ({
        ...prev,
        ...userUpdates,
      }));
      setSuccessMessage("Profile updated successfully!");
      setEditProfile({
        username: "",
        email: "",
        developer_experience: "",
        developer_projects_completed: "",
        developer_awards: "",
        developer_certifications: "",
        developer_description: "",
        developer_image: "",
        developer_logo: "",
        property_id: null,
      });
      setPreviewImages((prev) => ({
        ...prev,
        developer_image: previewImages.developer_image.length > 0 ? prev.developer_image : [],
        developer_logo: previewImages.developer_logo.length > 0 ? prev.developer_logo : [],
      }));
      document.getElementById("edit-developer-profile-dialog").close();
    } catch (err) {
      console.error("Profile: Failed to update developer profile:", err);
      setError(err.message || "Failed to update profile.");
    }
  };

  const handleEditProperty = useCallback(
    async (e) => {
      e.preventDefault();
      if (!editProperty) return;

      try {
        const propertyData = {
          ...editProperty,
          price: parseFloat(editProperty.price) || 0,
          carpet_area: parseInt(editProperty.carpet_area) || 0,
          total_floors: parseInt(editProperty.total_floors) || 0,
          total_units: parseInt(editProperty.total_units) || 0,
          developer_experience:
            parseInt(editProperty.developer_experience) || null,
          developer_projects_completed:
            parseInt(editProperty.developer_projects_completed) || null,
          developer_happy_families:
            parseInt(editProperty.developer_happy_families) || null,
          agent_rating: parseFloat(editProperty.agent_rating) || null,
          agent_reviews: parseInt(editProperty.agent_reviews) || null,
          nearby_landmarks: editProperty.nearby_landmarks || "",
          developer_id: user.id,
          images: editProperty.images || "",
          agents_image: editProperty.agents_image || "",
          developer_image: editProperty.developer_image || "",
          developer_logo: editProperty.developer_logo || "",
          developer_description: editProperty.developer_description || "",
        };

        if (
          propertyData.developer_description &&
          propertyData.developer_description.length > 1000
        ) {
          throw new Error("Developer description cannot exceed 1000 characters.");
        }

        const missingFields = requiredFields.filter(
          (field) => !propertyData[field] && propertyData[field] !== 0
        );
        if (missingFields.length > 0)
          throw new Error(
            `Missing required fields: ${missingFields.join(", ")}`
          );

        const { data, error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", editProperty.id)
          .select("*");

        if (error)
          throw new Error(
            `Failed to update property: ${error.message.includes("unique")
              ? "RERA number already exists."
              : error.message
            }`
          );

        setProperties((prev) =>
          prev.map((p) => (p.id === editProperty.id ? data[0] : p))
        );
        setEditProperty(null);
        setPreviewImages((prev) => ({
          ...prev,
          images: [],
          agents_image: [],
          developer_image: [],
          developer_logo: [],
        }));
        setSuccessMessage("Property updated successfully!");
        setError(null);
      } catch (err) {
        console.error("Profile: Error in handleEditProperty:", err);
        setError(err.message);
      }
    },
    [editProperty, user]
  );

  const handleDeleteProperty = async (id) => {
    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw new Error(`Failed to delete property: ${error.message}`);
      setProperties(properties.filter((p) => p.id !== id));
      setSuccessMessage("Property deleted successfully!");
      setError(null);
    } catch (err) {
      console.error("Profile: Error in handleDeleteProperty:", err);
      setError(err.message);
    }
  };

  const handleWishlistCriteriaChange = (e) => {
    const { name, value } = e.target;
    setWishlistCriteria((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveWishlistCriteria = async () => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ wishlist_criteria: wishlistCriteria })
        .eq("id", user.id);

      if (error)
        throw new Error(`Failed to save wishlist criteria: ${error.message}`);
      setSuccessMessage("Wishlist criteria saved successfully!");
      setError(null);
    } catch (err) {
      console.error("Profile: Error in handleSaveWishlistCriteria:", err);
      setError(err.message);
    }
  };

  const handleRemoveWishlistItem = async (propertyId) => {
    try {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("property_id", propertyId);

      if (error)
        throw new Error(`Failed to remove wishlist item: ${error.message}`);
      setWishlist(wishlist.filter((item) => item.property_id !== propertyId));
      setSuccessMessage("Wishlist item removed successfully!");
      setError(null);
    } catch (err) {
      console.error("Profile: Error in handleRemoveWishlistItem:", err);
      setError(err.message);
    }
  };

  const filteredWishlist = wishlist.filter((item) => {
    const criteria = wishlistCriteria;
    const property = item.properties;

    const locationMatch =
      !criteria.location ||
      property.location.toLowerCase().includes(criteria.location.toLowerCase());
    const priceMatch =
      !criteria.price ||
      (() => {
        const [min, max] = criteria.price
          .split("-")
          .map((p) =>
            p === "+" ? Infinity : parseInt(p.replace(/[^0-9]/g, "")) || 0
          );
        const price = parseInt(property.price) || 0;
        return min <= price && (max === Infinity ? true : price <= max);
      })();
    const areaMatch =
      !criteria.area ||
      (() => {
        const propArea = parseInt(property.carpet_area) || 0;
        const critArea = parseInt(criteria.area) || criteria.area.toLowerCase();
        return isNaN(propArea) || isNaN(parseInt(critArea))
          ? property.carpet_area?.toLowerCase().includes(critArea)
          : propArea >= parseInt(critArea);
      })();
    const typeMatch =
      !criteria.property_type ||
      property.property_type === criteria.property_type;
    const statusMatch = !criteria.status || property.status === criteria.status;

    return locationMatch && priceMatch && areaMatch && typeMatch && statusMatch;
  });

  const handleEnterKey = (e, name) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentIndex = requiredFields.indexOf(name);
      if (currentIndex !== -1) {
        if (newProperty[name] && newProperty[name].trim() !== "") {
          const nextIndex = (currentIndex + 1) % requiredFields.length;
          const nextField = requiredFields[nextIndex];
          const nextInput = document.querySelector(
            `input[name="${nextField}"], select[name="${nextField}"]`
          );
          if (nextInput) nextInput.focus();
        }
      } else {
        const allFields = Object.keys(newProperty).filter(
          (f) =>
            ![
              "amenities",
              "images",
              "agents_image",
              "developer_image",
              "developer_logo",
            ].includes(f)
        );
        const currentIndexOptional = allFields.indexOf(name);
        if (currentIndexOptional !== -1) {
          const nextIndex = (currentIndexOptional + 1) % allFields.length;
          const nextField = allFields[nextIndex];
          const nextInput = document.querySelector(
            `input[name="${nextField}"], select[name="${nextField}"], textarea[name="${nextField}"]`
          );
          if (nextInput) nextInput.focus();
        }
      }
    }
  };

  const renderImages = (imageUrls, altPrefix) => {
    if (!imageUrls || imageUrls.length === 0) {
      return null;
    }

    return (
      <div
        className="flex flex-wrap gap-2 mt-2"
        role="region"
        aria-label={`${altPrefix} preview`}
      >
        {imageUrls.map((url, index) => (
          <div key={index} className="relative">
            <img
              src={url.trim()}
              alt={`${altPrefix} ${index + 1}`}
              className="w-20 h-20 object-cover rounded"
              onError={(e) => {
                console.error(
                  `Profile: Failed to load ${altPrefix.toLowerCase()} image:`,
                  url
                );
                e.target.src = PLACEHOLDER_IMAGE_URL;
                setError(
                  `Failed to load ${altPrefix.toLowerCase()} image. Using placeholder.`
                );
              }}
            />
            <span className="text-xs text-stone-600 absolute top-0 right-0 bg-white rounded-full p-1">
              {index + 1}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
      </div>
    );
  }

  return (
    <div>
      <motion.section
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="relative h-[60vh] overflow-hidden bg-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={user.developer_logo || PLACEHOLDER_IMAGE_URL}
            alt="Developer Logo"
            className="w-full h-[60vh] object-center"
            onError={(e) => {
              console.error("Failed to load hero image:", e.target.src);
              e.target.src = PLACEHOLDER_IMAGE_URL;
            }}
          />
          <div className="absolute inset-0 bg-black/60 z-0"></div>
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="px-4 max-w-4xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-3">
                Welcome, {user.username}!
              </h1>
              <p className="text-xl md:text-2xl max-w-xl mx-auto mt-2">
                {user.role === "developer"
                  ? "Manage your properties and showcase your expertise."
                  : "Explore your wishlist and criteria."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Profile Section */}
      <motion.section
        className="py-12 px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">
            Profile
          </h2>
          <div className="bg-stone-100 rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex justify-center">
                    {user.role === "developer" && user.developer_image ? (
                      <img
                        src={
                          user.developer_image.split(",")[0] ||
                          PLACEHOLDER_IMAGE_URL
                        }
                        alt="Developer Image"
                        className="w-24 h-24 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = PLACEHOLDER_IMAGE_URL;
                          console.error(
                            "Profile: Failed to load developer image:",
                            user.developer_image
                          );
                        }}
                      />
                    ) : (
                      <FaUser className="inline rounded-full text-stone-700 w-20 h-20" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-3xl font-bold text-gray-800">
                        {properties[0]?.developer_name || user.username}
                      </h2>
                    </div>
                    <p className="text-stone-600">{user.email}</p>
                  </div>
                </div>
                {user.role === "developer" && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-stone-700 mb-2">
                      About {properties[0]?.developer_name}
                    </h3>
                    <p className="text-stone-600 leading-relaxed">
                      {properties[0]?.developer_description ||
                        "Add a description to showcase your expertise."}
                    </p>
                  </div>
                )}
              </div>
              {user.role === "developer" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 shadow p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">
                      {properties[0]?.developer_experience || "N/A"}+
                    </div>
                    <div className="text-gray-600">Years Experience</div>
                  </div>
                  <div className="bg-gray-50 shadow p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">
                      {properties[0]?.developer_projects_completed || "N/A"}+
                    </div>
                    <div className="text-gray-600">Projects Completed</div>
                  </div>
                  <div className="bg-gray-50 shadow p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">
                      {properties[0]?.developer_awards || "N/A"}+
                    </div>
                    <div className="text-gray-600">Awards Won</div>
                  </div>
                  <div className="bg-gray-50 shadow p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">
                      {properties[0]?.developer_certifications || "N/A"}
                    </div>
                    <div className="text-gray-600">Certified</div>
                  </div>
                </div>
              )}
            </div>

            {user.role === "developer" && (
              <motion.dialog
                id="edit-developer-profile-dialog"
                className="fixed inset-0 m-auto bg-white shadow-lg w-full max-w-4xl max-h-screen rounded-lg p-6 sm:p-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <form
                  onSubmit={handleEditProfile}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  <h3 className="text-2xl font-bold text-stone-700 mb-4 md:col-span-2">
                    Edit Developer Profile
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={editProfile.username}
                      onChange={(e) =>
                        setEditProfile({
                          ...editProfile,
                          username: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter username"
                      aria-label="Developer username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editProfile.email}
                      onChange={(e) =>
                        setEditProfile({
                          ...editProfile,
                          email: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter email"
                      aria-label="Developer email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Experience
                    </label>
                    <input
                      type="number"
                      name="developer_experience"
                      value={editProfile.developer_experience}
                      onChange={(e) =>
                        setEditProfile({
                          ...editProfile,
                          developer_experience: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter experience in years (optional)"
                      aria-label="Developer experience"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Projects Completed
                    </label>
                    <input
                      type="number"
                      name="developer_projects_completed"
                      value={editProfile.developer_projects_completed}
                      onChange={(e) =>
                        setEditProfile({
                          ...editProfile,
                          developer_projects_completed: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter projects completed (optional)"
                      aria-label="Developer projects completed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Awards
                    </label>
                    <input
                      type="text"
                      name="developer_awards"
                      value={editProfile.developer_awards}
                      onChange={(e) =>
                        setEditProfile({
                          ...editProfile,
                          developer_awards: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter awards (optional)"
                      aria-label="Developer awards"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Certifications
                    </label>
                    <input
                      type="text"
                      name="developer_certifications"
                      value={editProfile.developer_certifications}
                      onChange={(e) =>
                        setEditProfile({
                          ...editProfile,
                          developer_certifications: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter certifications (optional)"
                      aria-label="Developer certifications"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Description
                    </label>
                    <textarea
                      name="developer_description"
                      value={editProfile.developer_description}
                      onChange={(e) =>
                        setEditProfile({
                          ...editProfile,
                          developer_description: e.target.value,
                        })
                      }
                      onKeyPress={(e) => handleEnterKey(e, "developer_description")}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter a description about your company (max 1000 characters)"
                      maxLength={1000}
                      rows={5}
                      aria-label="Developer description"
                    />
                    <p className="text-sm text-stone-600 mt-1">
                      {editProfile.developer_description.length}/1000 characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Image
                    </label>
                    <div className="relative flex gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          id="developer-image-input"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(e, "developer_image")
                          }
                          className="absolute opacity-0 w-0 h-0"
                          aria-label="Upload developer image"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("developer-image-input")
                              .click()
                          }
                          className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                        >
                          Choose Image
                        </button>
                      </div>
                      {previewImages.developer_image.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleClearImage("developer_image")}
                          className="text-stone-700 hover:text-stone-900"
                          aria-label="Clear developer image"
                        >
                          <FaTrash className="inline text-xl" />
                        </button>
                      )}
                    </div>
                    {previewImages.developer_image.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-stone-600">
                          Uploaded Developer Image:
                        </p>
                        {renderImages(
                          previewImages.developer_image,
                          "Developer Image"
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Logo
                    </label>
                    <div className="relative flex gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          id="developer-logo-input"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(e, "developer_logo")
                          }
                          className="absolute opacity-0 w-0 h-0"
                          aria-label="Upload developer logo"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("developer-logo-input")
                              .click()
                          }
                          className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                        >
                          Choose Logo
                        </button>
                      </div>
                      {previewImages.developer_logo.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleClearImage("developer_logo")}
                          className="text-stone-700 hover:text-stone-900"
                          aria-label="Clear developer logo"
                        >
                          <FaTrash className="inline text-xl" />
                        </button>
                      )}
                    </div>
                    {previewImages.developer_logo.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-stone-600">
                          Uploaded Developer Logo:
                        </p>
                        {renderImages(
                          previewImages.developer_logo,
                          "Developer Logo"
                        )}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-4">
                    <button
                      type="submit"
                      className="relative inline-block w-40 h-9 rounded-lg font-medium text-white bg-stone-700 z-10 overflow-hidden
          before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
          before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                      aria-label="Save developer profile"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        document
                          .getElementById("edit-developer-profile-dialog")
                          .close();
                        setEditProfile({
                          username: "",
                          email: "",
                          developer_experience: "",
                          developer_projects_completed: "",
                          developer_awards: "",
                          developer_certifications: "",
                          developer_description: "",
                          developer_image: "",
                          developer_logo: "",
                          property_id: null,
                        });
                        setPreviewImages((prev) => ({
                          ...prev,
                          developer_image: [],
                          developer_logo: [],
                        }));
                      }}
                      className="relative inline-block w-40 h-9 rounded-lg font-medium text-stone-700 border border-stone-700 z-10 overflow-hidden
          before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-700
          before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:border-none hover:text-white"
                      aria-label="Cancel developer profile edit"
                    >
                      Cancel
                    </button>
                  </div>
                  {error && (
                    <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                      {error}
                      <button
                        onClick={() => setError(null)}
                        className="ml-2 text-red-700 hover:text-red-900"
                        aria-label="Dismiss error"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {successMessage && (
                    <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center">
                      {successMessage}
                      <button
                        onClick={() => setSuccessMessage(null)}
                        className="ml-2 text-green-700 hover:text-green-900"
                        aria-label="Dismiss success message"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </form>
              </motion.dialog>
            )}
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/login", { state: { from: location.pathname } });
                }}
                className="relative mt-2 inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
              before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
              before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                aria-label="Log out"
              >
                Log Out
              </button>
              {user.role === "developer" && (
                <button
                  onClick={() => {
                    const recentProperty = properties[0] || {};
                    setEditProfile({
                      username: user.username,
                      email: user.email,
                      developer_experience: recentProperty.developer_experience || "",
                      developer_projects_completed:
                        recentProperty.developer_projects_completed || "",
                      developer_awards: recentProperty.developer_awards || "",
                      developer_certifications: recentProperty.developer_certifications || "",
                      developer_description: recentProperty.developer_description || "",
                      developer_image: user.developer_image || "",
                      developer_logo: user.developer_logo || "",
                      property_id: recentProperty.id || null,
                    });
                    setPreviewImages((prev) => ({
                      ...prev,
                      developer_image: user.developer_image
                        ? user.developer_image.split(",").filter((url) => url.trim())
                        : [],
                      developer_logo: user.developer_logo
                        ? user.developer_logo.split(",").filter((url) => url.trim())
                        : [],
                    }));
                    document.getElementById("edit-developer-profile-dialog").showModal();
                  }}
                  className="relative mt-2 inline-block px-6 py-2 border-1 border-stone-700 rounded font-medium text-stone-700 bg-stone-100 z-10 overflow-hidden
              before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-700
              before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                  aria-label={`Edit developer profile for ${user.username}`}
                >Profile
                  <FaEdit className="inline ml-1 mb-1 text-xl" />
                </button>
              )}
            </div>
          </div>
          {user.role === "developer" && (
            <>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  document.getElementById("add-property-dialog").showModal();
                }}
                className="relative mb-6 inline-block px-6 py-2 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
                  before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                  before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                aria-label="Show add property form"
              >
                <FaPlus className="inline mr-2" /> Add Property
              </button>

              <dialog
                id="add-property-dialog"
                className="fixed inset-0 m-auto bg-white shadow-lg w-full max-w-4xl max-h-screen rounded-lg p-6 sm:p-8 overflow-y-auto"
              >
                <form
                  onSubmit={handleAddProperty}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  <h3 className="text-2xl font-bold text-stone-700 mb-4 md:col-span-2">
                    Add Property
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Property Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newProperty.name}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "name")}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter property name"
                      aria-label="Property name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={newProperty.location}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "location")}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter location"
                      aria-label="Location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={newProperty.price}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "price")}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter price"
                      aria-label="Price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Carpet Area (sq.ft) *
                    </label>
                    <input
                      type="number"
                      name="carpet_area"
                      value={newProperty.carpet_area}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "carpet_area")}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter carpet area"
                      aria-label="Carpet area"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Configuration *
                    </label>
                    <input
                      type="text"
                      name="configuration"
                      value={newProperty.configuration}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "configuration")}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="e.g., 2 BHK"
                      aria-label="Configuration"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Property Type *
                    </label>
                    <select
                      name="property_type"
                      value={newProperty.property_type}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "property_type")}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      aria-label="Property type"
                    >
                      <option value="">Select type</option>
                      <option value="Flat">Flat</option>
                      <option value="Villa">Villa</option>
                      <option value="Plot">Plot</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Total Floors *
                    </label>
                    <input
                      type="number"
                      name="total_floors"
                      value={newProperty.total_floors}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "total_floors")}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter total floors"
                      aria-label="Total floors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Total Units *
                    </label>
                    <input
                      type="number"
                      name="total_units"
                      value={newProperty.total_units}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "total_units")}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter total units"
                      aria-label="Total units"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={newProperty.status}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "status")}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      aria-label="Status"
                    >
                      <option value="">Select status</option>
                      <option value="Ready">Ready to Move</option>
                      <option value="Under Construction">
                        Under Construction
                      </option>
                      <option value="Upcoming">Upcoming</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      RERA Number *
                    </label>
                    <input
                      type="text"
                      name="rera_number"
                      value={newProperty.rera_number}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "rera_number")}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter RERA number"
                      aria-label="RERA number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Amenities
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "24/7 Security",
                        "Lift",
                        "Parking",
                        "Swimming Pool",
                        "Gym",
                        "Clubhouse",
                      ].map((amenity) => (
                        <label key={amenity} className="flex items-center">
                          <input
                            type="checkbox"
                            value={amenity}
                            checked={newProperty.amenities.includes(amenity)}
                            onChange={handleAmenitiesChange}
                            className="mr-2"
                            aria-label={`Amenity: ${amenity}`}
                          />
                          {amenity}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Name *
                    </label>
                    <input
                      type="text"
                      name="developer_name"
                      value={newProperty.developer_name}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "developer_name")}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter developer name"
                      aria-label="Developer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Tagline
                    </label>
                    <input
                      type="text"
                      name="developer_tagline"
                      value={newProperty.developer_tagline}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "developer_tagline")}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter developer tagline (optional)"
                      aria-label="Developer tagline"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Experience
                    </label>
                    <input
                      type="number"
                      name="developer_experience"
                      value={newProperty.developer_experience}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) =>
                        handleEnterKey(e, "developer_experience")
                      }
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter developer experience (optional)"
                      aria-label="Developer experience"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Projects Completed
                    </label>
                    <input
                      type="number"
                      name="developer_projects_completed"
                      value={newProperty.developer_projects_completed}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) =>
                        handleEnterKey(e, "developer_projects_completed")
                      }
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter projects completed (optional)"
                      aria-label="Developer projects completed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Happy Families
                    </label>
                    <input
                      type="number"
                      name="developer_happy_families"
                      value={newProperty.developer_happy_families}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) =>
                        handleEnterKey(e, "developer_happy_families")
                      }
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter happy families (optional)"
                      aria-label="Developer happy families"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Nearby Landmarks *
                    </label>
                    <input
                      type="text"
                      name="nearby_landmarks"
                      value={newProperty.nearby_landmarks}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "nearby_landmarks")}
                      required
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter landmarks as text (e.g., Park, School)"
                      aria-label="Nearby landmarks"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Description
                    </label>
                    <textarea
                      name="developer_description"
                      value={newProperty.developer_description}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) =>
                        handleEnterKey(e, "developer_description")
                      }
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter a description about your company (max 1000 characters)"
                      maxLength={1000}
                      rows={5}
                      aria-label="Developer description"
                    />
                    <p className="text-sm text-stone-600 mt-1">
                      {newProperty.developer_description.length}/1000 characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Agent Name
                    </label>
                    <input
                      type="text"
                      name="agent_name"
                      value={newProperty.agent_name}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "agent_name")}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter agent name (optional)"
                      aria-label="Agent name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Agent Role
                    </label>
                    <input
                      type="text"
                      name="agent_role"
                      value={newProperty.agent_role}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "agent_role")}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter agent role (optional)"
                      aria-label="Agent role"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Agent Phone
                    </label>
                    <input
                      type="text"
                      name="agent_phone"
                      value={newProperty.agent_phone}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "agent_phone")}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter agent phone (optional)"
                      aria-label="Agent phone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Agent Email
                    </label>
                    <input
                      type="email"
                      name="agent_email"
                      value={newProperty.agent_email}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "agent_email")}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter agent email (optional)"
                      aria-label="Agent email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Agent Availability
                    </label>
                    <input
                      type="text"
                      name="agent_availability"
                      value={newProperty.agent_availability}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) =>
                        handleEnterKey(e, "agent_availability")
                      }
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter agent availability (optional)"
                      aria-label="Agent availability"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Agent Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="agent_rating"
                      value={newProperty.agent_rating}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "agent_rating")}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter agent rating (optional, 0-5)"
                      aria-label="Agent rating"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Agent Reviews
                    </label>
                    <input
                      type="number"
                      name="agent_reviews"
                      value={newProperty.agent_reviews}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "agent_reviews")}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter agent reviews (optional)"
                      aria-label="Agent reviews"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Awards
                    </label>
                    <input
                      type="text"
                      name="developer_awards"
                      value={newProperty.developer_awards}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) => handleEnterKey(e, "developer_awards")}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter developer awards (optional)"
                      aria-label="Developer awards"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Certifications
                    </label>
                    <input
                      type="text"
                      name="developer_certifications"
                      value={newProperty.developer_certifications}
                      onChange={handlePropertyChange}
                      onKeyPress={(e) =>
                        handleEnterKey(e, "developer_certifications")
                      }
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter developer certifications (optional)"
                      aria-label="Developer certifications"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Property Images
                    </label>
                    <div className="relative flex gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          id="add-property-images-input"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageUpload(e, "images")}
                          className="absolute opacity-0 w-0 h-0"
                          aria-label="Upload property images"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("add-property-images-input")
                              .click()
                          }
                          className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                        >
                          Choose Images
                        </button>
                      </div>
                      {previewImages.images.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleClearImage("images")}
                          className="text-stone-700 hover:text-stone-900"
                          aria-label="Clear property images"
                        >
                          <FaTrash className="inline text-xl" />
                        </button>
                      )}
                    </div>
                    {previewImages.images.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-stone-600">
                          Uploaded Property Images:
                        </p>
                        {renderImages(previewImages.images, "Property Image")}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Agent Image
                    </label>
                    <div className="relative flex gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          id="add-agent-image-input"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "agents_image")}
                          className="absolute opacity-0 w-0 h-0"
                          aria-label="Upload agent image"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("add-agent-image-input")
                              .click()
                          }
                          className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                        >
                          Choose Image
                        </button>
                      </div>
                      {previewImages.agents_image.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleClearImage("agents_image")}
                          className="text-stone-700 hover:text-stone-900"
                          aria-label="Clear agent image"
                        >
                          <FaTrash className="inline text-xl" />
                        </button>
                      )}
                    </div>
                    {previewImages.agents_image.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-stone-600">
                          Uploaded Agent Image:
                        </p>
                        {renderImages(
                          previewImages.agents_image,
                          "Agent Image"
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Image
                    </label>
                    <div className="relative flex gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          id="add-developer-image-input"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(e, "developer_image")
                          }
                          className="absolute opacity-0 w-0 h-0"
                          aria-label="Upload developer image"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("add-developer-image-input")
                              .click()
                          }
                          className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                        >
                          Choose Image
                        </button>
                      </div>
                      {previewImages.developer_image.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleClearImage("developer_image")}
                          className="text-stone-700 hover:text-stone-900"
                          aria-label="Clear developer image"
                        >
                          <FaTrash className="inline text-xl" />
                        </button>
                      )}
                    </div>
                    {previewImages.developer_image.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-stone-600">
                          Uploaded Developer Image:
                        </p>
                        {renderImages(
                          previewImages.developer_image,
                          "Developer Image"
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Developer Logo
                    </label>
                    <div className="relative flex gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          id="add-developer-logo-input"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(e, "developer_logo")
                          }
                          className="absolute opacity-0 w-0 h-0"
                          aria-label="Upload developer logo"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("add-developer-logo-input")
                              .click()
                          }
                          className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                        >
                          Choose Logo
                        </button>
                      </div>
                      {previewImages.developer_logo.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleClearImage("developer_logo")}
                          className="text-stone-700 hover:text-stone-900"
                          aria-label="Clear developer logo"
                        >
                          <FaTrash className="inline text-xl" />
                        </button>
                      )}
                    </div>
                    {previewImages.developer_logo.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-stone-600">
                          Uploaded Developer Logo:
                        </p>
                        {renderImages(
                          previewImages.developer_logo,
                          "Developer Logo"
                        )}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-4">
                    <button
                      type="submit"
                      className="relative h-9 w-40 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
                        before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                        before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                      aria-label="Add property"
                    >
                      Add Property
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        document.getElementById("add-property-dialog").close();
                        setNewProperty({
                          name: "",
                          location: "",
                          price: "",
                          carpet_area: "",
                          configuration: "",
                          property_type: "",
                          total_floors: "",
                          total_units: "",
                          status: "",
                          rera_number: "",
                          amenities: [],
                          developer_name: "",
                          developer_tagline: "",
                          developer_experience: "",
                          developer_projects_completed: "",
                          developer_happy_families: "",
                          nearby_landmarks: "",
                          agent_name: "",
                          agent_role: "",
                          agent_phone: "",
                          agent_email: "",
                          agent_availability: "",
                          agent_rating: "",
                          agent_reviews: "",
                          images: "",
                          agents_image: "",
                          developer_image: "",
                          developer_awards: "",
                          developer_certifications: "",
                          developer_description: "",
                          developer_logo: "",
                        });
                        setPreviewImages((prev) => ({
                          ...prev,
                          images: [],
                          agents_image: [],
                          developer_image: [],
                          developer_logo: [],
                        }));
                      }}
                      className="relative inline-block w-40 h-9 rounded-lg font-medium text-stone-700 border border-stone-700 z-10 overflow-hidden
                        before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-700
                                                before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:border-none hover:text-white"
                      aria-label="Cancel add property"
                    >
                      Cancel
                    </button>
                  </div>
                  {error && (
                    <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center md:col-span-2">
                      {error}
                      <button
                        onClick={() => setError(null)}
                        className="ml-2 text-red-700 hover:text-red-900"
                        aria-label="Dismiss error"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {successMessage && (
                    <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center md:col-span-2">
                      {successMessage}
                      <button
                        onClick={() => setSuccessMessage(null)}
                        className="ml-2 text-green-700 hover:text-green-900"
                        aria-label="Dismiss success message"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </form>
              </dialog>

              <h3 className="text-2xl font-bold text-stone-700 mb-4">
                Your Properties
              </h3>
              {properties.length === 0 ? (
                <p className="text-stone-600">No properties added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <motion.div
                      key={property.id}
                      className="bg-white text-white rounded-lg shadow-md hover:shadow-lg transition-shadow group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="relative group h-[300px] w-full overflow-hidden rounded">
                        <img
                          src={
                            property.images
                              ? property.images.split(",")[0].trim()
                              : PLACEHOLDER_IMAGE_URL
                          }
                          alt={property.name}
                          className="w-full h-full transition-transform duration-300 group-hover:scale-105 rounded"
                          onError={(e) => {
                            console.error(
                              "Profile: Failed to load property image:",
                              property.images
                            );
                            e.target.src = PLACEHOLDER_IMAGE_URL;
                          }}
                        />
                        <div className="absolute inset-0 bg-black opacity-40 md:opacity-0 md:group-hover:opacity-40 transition-opacity duration-300 z-0"></div>
                        <div className="absolute inset-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                          <div className="absolute bottom-4 left-4 text-left">
                            <h4 className="text-xl font-semibold">
                              {property.name}
                            </h4>
                            <p className="flex items-center">
                              <FaMapMarkerAlt className="mr-2" />{" "}
                              {property.location}
                            </p>
                            <p className="flex items-center">
                              <FaMoneyBill className="mr-2" /> ₹
                              {property.price.toLocaleString()}
                            </p>
                            <p>
                              {property.configuration
                                ? `${property.configuration} • `
                                : ""}
                              {property.property_type}
                            </p>
                            <p>{property.status}</p>
                            <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              Built by:{" "}
                              {property.developer_name || "Unknown Developer"}
                            </p>
                            <div className="mt-4 flex gap-4">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setEditProperty({
                                    ...property,
                                    amenities: property.amenities || [],
                                  });
                                  setPreviewImages({
                                    ...previewImages,
                                    images: property.images
                                      ? property.images
                                        .split(",")
                                        .filter((url) => url.trim())
                                      : [],
                                    agents_image: property.agents_image
                                      ? property.agents_image
                                        .split(",")
                                        .filter((url) => url.trim())
                                      : [],
                                    developer_image: property.developer_image
                                      ? property.developer_image
                                        .split(",")
                                        .filter((url) => url.trim())
                                      : [],
                                    developer_logo: property.developer_logo
                                      ? property.developer_logo
                                        .split(",")
                                        .filter((url) => url.trim())
                                      : [],
                                  });
                                  document
                                    .getElementById("edit-property-dialog")
                                    .showModal();
                                }}
                                aria-label={`Edit property ${property.name}`}
                              >
                                <FaEdit className="inline hover:font-semibold" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteProperty(property.id);
                                }}
                                aria-label={`Delete property ${property.name}`}
                              >
                                <FaTrash className="inline hover:font-semibold" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <dialog
                id="edit-property-dialog"
                className="fixed inset-0 m-auto bg-white shadow-lg w-full max-w-4xl max-h-screen rounded-lg p-6 sm:p-8"
              >
                {editProperty && (
                  <form
                    onSubmit={handleEditProperty}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                  >
                    <h3 className="text-2xl font-bold text-stone-700 mb-4 md:col-span-2">
                      Edit Property
                    </h3>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Property Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editProperty.name}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "name")}
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter property name"
                        aria-label="Property name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={editProperty.location}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "location")}
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter location"
                        aria-label="Location"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={editProperty.price}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "price")}
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter price"
                        aria-label="Price"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Carpet Area (sq.ft) *
                      </label>
                      <input
                        type="number"
                        name="carpet_area"
                        value={editProperty.carpet_area}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "carpet_area")}
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter carpet area"
                        aria-label="Carpet area"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Configuration *
                      </label>
                      <input
                        type="text"
                        name="configuration"
                        value={editProperty.configuration}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "configuration")}
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="e.g., 2 BHK"
                        aria-label="Configuration"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Property Type *
                      </label>
                      <select
                        name="property_type"
                        value={editProperty.property_type}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "property_type")}
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        aria-label="Property type"
                      >
                        <option value="">Select type</option>
                        <option value="Flat">Flat</option>
                        <option value="Villa">Villa</option>
                        <option value="Plot">Plot</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Total Floors *
                      </label>
                      <input
                        type="number"
                        name="total_floors"
                        value={editProperty.total_floors}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "total_floors")}
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter total floors"
                        aria-label="Total floors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Total Units *
                      </label>
                      <input
                        type="number"
                        name="total_units"
                        value={editProperty.total_units}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "total_units")}
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter total units"
                        aria-label="Total units"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Status *
                      </label>
                      <select
                        name="status"
                        value={editProperty.status}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "status")}
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        aria-label="Status"
                      >
                        <option value="">Select status</option>
                        <option value="Ready">Ready to Move</option>
                        <option value="Under Construction">
                          Under Construction
                        </option>
                        <option value="Upcoming">Upcoming</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        RERA Number *
                      </label>
                      <input
                        type="text"
                        name="rera_number"
                        value={editProperty.rera_number}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "rera_number")}
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter RERA number"
                        aria-label="RERA number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Amenities
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "24/7 Security",
                          "Lift",
                          "Parking",
                          "Swimming Pool",
                          "Gym",
                          "Clubhouse",
                        ].map((amenity) => (
                          <label key={amenity} className="flex items-center">
                            <input
                              type="checkbox"
                              value={amenity}
                              checked={editProperty.amenities.includes(amenity)}
                              onChange={handleAmenitiesChange}
                              className="mr-2"
                              aria-label={`Amenity: ${amenity}`}
                            />
                            {amenity}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Developer Name *
                      </label>
                      <input
                        type="text"
                        name="developer_name"
                        value={editProperty.developer_name}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "developer_name")}
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter developer name"
                        aria-label="Developer name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Developer Tagline
                      </label>
                      <input
                        type="text"
                        name="developer_tagline"
                        value={editProperty.developer_tagline}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) =>
                          handleEnterKey(e, "developer_tagline")
                        }
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter developer tagline (optional)"
                        aria-label="Developer tagline"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Developer Experience
                      </label>
                      <input
                        type="number"
                        name="developer_experience"
                        value={editProperty.developer_experience}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) =>
                          handleEnterKey(e, "developer_experience")
                        }
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter developer experience (optional)"
                        aria-label="Developer experience"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Developer Projects Completed
                      </label>
                      <input
                        type="number"
                        name="developer_projects_completed"
                        value={editProperty.developer_projects_completed}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) =>
                          handleEnterKey(e, "developer_projects_completed")
                        }
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter projects completed (optional)"
                        aria-label="Developer projects completed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Developer Happy Families
                      </label>
                      <input
                        type="number"
                        name="developer_happy_families"
                        value={editProperty.developer_happy_families}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) =>
                          handleEnterKey(e, "developer_happy_families")
                        }
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter happy families (optional)"
                        aria-label="Developer happy families"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Nearby Landmarks *
                      </label>
                      <input
                        type="text"
                        name="nearby_landmarks"
                        value={editProperty.nearby_landmarks}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) =>
                          handleEnterKey(e, "nearby_landmarks")
                        }
                        required
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter landmarks as text (e.g., Park, School)"
                        aria-label="Nearby landmarks"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Agent Name
                      </label>
                      <input
                        type="text"
                        name="agent_name"
                        value={editProperty.agent_name}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "agent_name")}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter agent name (optional)"
                        aria-label="Agent name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Agent Role
                      </label>
                      <input
                        type="text"
                        name="agent_role"
                        value={editProperty.agent_role}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "agent_role")}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter agent role (optional)"
                        aria-label="Agent role"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Agent Phone
                      </label>
                      <input
                        type="text"
                        name="agent_phone"
                        value={editProperty.agent_phone}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "agent_phone")}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter agent phone (optional)"
                        aria-label="Agent phone"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Agent Email
                      </label>
                      <input
                        type="email"
                        name="agent_email"
                        value={editProperty.agent_email}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "agent_email")}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter agent email (optional)"
                        aria-label="Agent email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Agent Availability
                      </label>
                      <input
                        type="text"
                        name="agent_availability"
                        value={editProperty.agent_availability}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) =>
                          handleEnterKey(e, "agent_availability")
                        }
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter agent availability (optional)"
                        aria-label="Agent availability"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Agent Rating
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="agent_rating"
                        value={editProperty.agent_rating}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "agent_rating")}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter agent rating (optional, 0-5)"
                        aria-label="Agent rating"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Agent Reviews
                      </label>
                      <input
                        type="number"
                        name="agent_reviews"
                        value={editProperty.agent_reviews}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) => handleEnterKey(e, "agent_reviews")}
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter agent reviews (optional)"
                        aria-label="Agent reviews"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Property Images
                      </label>
                      <div className="relative flex gap-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            id="edit-property-images-input"
                            accept="image/*"
                            multiple
                            onChange={(e) =>
                              handleImageUpload(e, "images", editProperty.id)
                            }
                            className="absolute opacity-0 w-0 h-0"
                            aria-label="Upload property images"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              document
                                .getElementById("edit-property-images-input")
                                .click()
                            }
                            className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                          >
                            Choose Images
                          </button>
                        </div>
                        {previewImages.images.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleClearImage("images", editProperty.id)
                            }
                            className="text-stone-700 hover:text-stone-900"
                            aria-label="Clear property images"
                          >
                            <FaTrash className="inline text-xl" />
                          </button>
                        )}
                      </div>
                      {previewImages.images.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-stone-600">
                            Uploaded Property Images:
                          </p>
                          {renderImages(previewImages.images, "Property Image")}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Agent Image
                      </label>
                      <div className="relative flex gap-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            id="edit-agent-image-input"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(
                                e,
                                "agents_image",
                                editProperty.id
                              )
                            }
                            className="absolute opacity-0 w-0 h-0"
                            aria-label="Upload agent image"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              document
                                .getElementById("edit-agent-image-input")
                                .click()
                            }
                            className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                          >
                            Choose Image
                          </button>
                        </div>
                        {previewImages.agents_image.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleClearImage("agents_image", editProperty.id)
                            }
                            className="text-stone-700 hover:text-stone-900"
                            aria-label="Clear agent image"
                          >
                            <FaTrash className="inline text-xl" />
                          </button>
                        )}
                      </div>
                      {previewImages.agents_image.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-stone-600">
                            Uploaded Agent Image:
                          </p>
                          {renderImages(
                            previewImages.agents_image,
                            "Agent Image"
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Developer Image
                      </label>
                      <div className="relative flex gap-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            id="edit-developer-image-input"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(
                                e,
                                "developer_image",
                                editProperty.id
                              )
                            }
                            className="absolute opacity-0 w-0 h-0"
                            aria-label="Upload developer image"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              document
                                .getElementById("edit-developer-image-input")
                                .click()
                            }
                            className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                          >
                            Choose Image
                          </button>
                        </div>
                        {previewImages.developer_image.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleClearImage(
                                "developer_image",
                                editProperty.id
                              )
                            }
                            className="text-stone-700 hover:text-stone-900"
                            aria-label="Clear developer image"
                          >
                            <FaTrash className="inline text-xl" />
                          </button>
                        )}
                      </div>
                      {previewImages.developer_image.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-stone-600">
                            Uploaded Developer Image:
                          </p>
                          {renderImages(
                            previewImages.developer_image,
                            "Developer Image"
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Developer Logo
                      </label>
                      <div className="relative flex gap-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            id="edit-developer-logo-input"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(
                                e,
                                "developer_logo",
                                editProperty.id
                              )
                            }
                            className="absolute opacity-0 w-0 h-0"
                            aria-label="Upload developer logo"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              document
                                .getElementById("edit-developer-logo-input")
                                .click()
                            }
                            className="w-full px-4 py-3 border border-stone-300 rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                          >
                            Choose Logo
                          </button>
                        </div>
                        {previewImages.developer_logo.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleClearImage(
                                "developer_logo",
                                editProperty.id
                              )
                            }
                            className="text-stone-700 hover:text-stone-900"
                            aria-label="Clear developer logo"
                          >
                            <FaTrash className="inline text-xl" />
                          </button>
                        )}
                      </div>
                      {previewImages.developer_logo.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-stone-600">
                            Uploaded Developer Logo:
                          </p>
                          {renderImages(
                            previewImages.developer_logo,
                            "Developer Logo"
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Developer Description
                      </label>
                      <textarea
                        name="developer_description"
                        value={editProperty.developer_description}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) =>
                          handleEnterKey(e, "developer_description")
                        }
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter developer description (optional)"
                        aria-label="Developer description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Developer Awards
                      </label>
                      <input
                        type="text"
                        name="developer_awards"
                        value={editProperty.developer_awards}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) =>
                          handleEnterKey(e, "developer_awards")
                        }
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter developer awards (optional)"
                        aria-label="Developer awards"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        Developer Certifications
                      </label>
                      <input
                        type="text"
                        name="developer_certifications"
                        value={editProperty.developer_certifications}
                        onChange={handlePropertyChange}
                        onKeyPress={(e) =>
                          handleEnterKey(e, "developer_certifications")
                        }
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                        placeholder="Enter developer certifications (optional)"
                        aria-label="Developer certifications"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4">
                      <button
                        type="submit"
                        className="relative h-9 w-40 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
                          before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                          before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                        aria-label="Save property"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditProperty(null);
                          document
                            .getElementById("edit-property-dialog")
                            .close();
                          setPreviewImages((prev) => ({
                            ...prev,
                            images: [],
                            agents_image: [],
                            developer_image: [],
                            developer_logo: [],
                          }));
                        }}
                        className="relative inline-block w-40 h-9 rounded-lg font-medium text-stone-700 border border-stone-700 z-10 overflow-hidden
                          before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-700
                          before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:border-none hover:text-white"
                        aria-label="Cancel editing property"
                      >
                        Cancel
                      </button>
                    </div>
                    {error && (
                      <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center md:col-span-2">
                        {error}
                        <button
                          onClick={() => setError(null)}
                          className="ml-2 text-red-700 hover:text-red-900"
                          aria-label="Dismiss error"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    {successMessage && (
                      <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center md:col-span-2">
                        {successMessage}
                        <button
                          onClick={() => setSuccessMessage(null)}
                          className="ml-2 text-green-700 hover:text-green-900"
                          aria-label="Dismiss success message"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </dialog>
            </>
          )}

          {user.role !== "developer" && (
            <>
              <h3 className="text-4xl font-bold text-stone-700 mb-6 text-center">
                Your Wishlist Criteria
              </h3>
              <div className="bg-stone-100 rounded-lg shadow-md p-6 mb-8">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveWishlistCriteria();
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={wishlistCriteria.location}
                      onChange={handleWishlistCriteriaChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter preferred location"
                      aria-label="Wishlist location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Price Range (₹)
                    </label>
                    <select
                      name="price"
                      value={wishlistCriteria.price}
                      onChange={handleWishlistCriteriaChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      aria-label="Wishlist price range"
                    >
                      <option value="">Select price range</option>
                      <option value="0-5000000">Up to 50 Lakhs</option>
                      <option value="5000000-10000000">50 Lakhs - 1 Crore</option>
                      <option value="10000000-20000000">1 Crore - 2 Crores</option>
                      <option value="20000000-+">2 Crores+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Area (sq.ft)
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={wishlistCriteria.area}
                      onChange={handleWishlistCriteriaChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      placeholder="Enter minimum area (e.g., 1000)"
                      aria-label="Wishlist area"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Property Type
                    </label>
                    <select
                      name="property_type"
                      value={wishlistCriteria.property_type}
                      onChange={handleWishlistCriteriaChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      aria-label="Wishlist property type"
                    >
                      <option value="">Select type</option>
                      <option value="Flat">Flat</option>
                      <option value="Villa">Villa</option>
                      <option value="Plot">Plot</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={wishlistCriteria.status}
                      onChange={handleWishlistCriteriaChange}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500"
                      aria-label="Wishlist status"
                    >
                      <option value="">Select status</option>
                      <option value="Ready">Ready to Move</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="Upcoming">Upcoming</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="relative inline-block px-6 py-2 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
                        before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                        before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                      aria-label="Save wishlist criteria"
                    >
                      Save Criteria
                    </button>
                  </div>
                </form>
              </div>

              <h3 className="text-4xl font-bold text-stone-700 mb-6 text-center">
                Your Wishlist
              </h3>
              {filteredWishlist.length === 0 ? (
                <p className="text-stone-600 text-center">
                  No properties in your wishlist yet. Add some properties!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWishlist.map((item) => (
                    <motion.div
                      key={item.property_id}
                      className="bg-white rounded-lg shadow-md relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative group h-[300px] w-full overflow-hidden text-white rounded">
                        <img
                          src={
                            item.properties.images?.split(",")[0] ||
                            PLACEHOLDER_IMAGE_URL
                          }
                          alt={item.properties.name}
                          className="w-full h-full transition-transform duration-300 group-hover:scale-105 rounded"
                          onError={(e) => {
                            console.error(
                              "Profile: Failed to load wishlist property image:",
                              item.properties.images
                            );
                            e.target.src = PLACEHOLDER_IMAGE_URL;
                          }}
                        />
                        <div className="absolute inset-0 bg-black opacity-40 md:opacity-0 md:group-hover:opacity-40 transition-opacity duration-300 z-0"></div>
                        <div className="absolute inset-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                          <div className="absolute bottom-4 left-4 text-left">
                            <h4 className="text-xl font-semibold">
                              {item.properties.name}
                            </h4>
                            <p className="flex items-center">
                              <FaMapMarkerAlt className="mr-2" />{" "}
                              {item.properties.location}
                            </p>
                            <p className="flex items-center">
                              <FaMoneyBill className="mr-2" /> ₹{item.properties.price}
                            </p>
                            <p>
                              • {item.properties.property_type}
                            </p>
                            <p>• {item.properties.status}</p>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveWishlistItem(item.property_id)
                            }
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white hover:text-red-500"
                            aria-label={`Remove ${item.properties.name} from wishlist`}
                          >
                            <FaHeart className="inline mr-2 size-6 fill-white" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default Profile;