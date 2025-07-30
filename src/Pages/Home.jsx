import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import {
  Home as HomeIcon,
  CalendarDays,
  ClipboardList,
  MessageCircle,
  FileCheck2,
  BookOpen,
  DollarSign,
  Gavel,
  Palette,
  PhoneCall,
} from "lucide-react";

const Home = () => {
  const [searchInput, setSearchInput] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsInView, setStatsInView] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const cardRefs = useRef([]);
  const featuredRefs = useRef([]);
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;
    const scrollSpeed = 1;

    const interval = setInterval(() => {
      if (scrollContainer) {
        scrollAmount += scrollSpeed;
        scrollContainer.scrollLeft = scrollAmount;
        if (
          scrollAmount >=
          scrollContainer.scrollWidth - scrollContainer.clientWidth
        ) {
          scrollAmount = 0;
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  const zivaasRef = useRef(null);
  const [zivaasInView, setZivaasInView] = useState(false);
  const [zivaasCounts, setZivaasCounts] = useState([0, 0, 0]);
  const serviceRefs = useRef([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log("Fetching properties from Supabase");
        setLoading(true);
        const { data: propertiesData, error: propertiesError } = await supabase
          .from("properties")
          .select("*");

        if (propertiesError) {
          console.error("Properties fetch error:", propertiesError.message);
          throw new Error(
            `Failed to fetch properties: ${propertiesError.message}`
          );
        }

        if (!propertiesData || propertiesData.length === 0) {
          console.warn("No properties returned from Supabase");
          throw new Error("No properties available.");
        }

        const mappedProperties = propertiesData.map((p) => {
          const bhkMatch = (p.configuration || "").match(/\d+/);
          let imageUrl =
            "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80";

          if (p.images) {
            const firstUrl = p.images.split(",")[0].trim();
            if (firstUrl) {
              imageUrl = firstUrl;
            }
          }

          try {
            fetch(imageUrl, { method: "HEAD" });
          } catch (err) {
            console.warn(
              `Invalid image URL for ${p.name}: ${imageUrl}, using fallback`
            );
            imageUrl =
              "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80";
          }

          return {
            ...p,
            bhk: bhkMatch ? parseInt(bhkMatch[0]) : 0,
            type: (p.property_type || "").trim().toLowerCase(),
            progress:
              p.progress !== undefined
                ? p.progress
                : p.status === "Upcoming"
                ? 0
                : 1,
            image: imageUrl,
          };
        });

        console.log("Mapped properties:", mappedProperties);
        setProperties(mappedProperties);
        setError(null);
      } catch (error) {
        console.error("Error fetching properties:", error.message);
        setError(error.message);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    const section = document.getElementById("legacy-section");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.remove("opacity-0", "translate-y-8");
          section.classList.add("opacity-100", "translate-y-0");
          setStatsInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (section) observer.observe(section);
    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  useEffect(() => {
    if (!statsInView) return;

    const targets = [20, 100, 75, 40];
    const interval = 30;
    const steps = 50;
    const increments = targets.map((t) => Math.ceil(t / steps));
    let current = [0, 0, 0, 0];

    const counter = setInterval(() => {
      current = current.map((val, i) => {
        const next = val + increments[i];
        return next >= targets[i] ? targets[i] : next;
      });

      setCounts([...current]);

      if (current.every((val, i) => val >= targets[i])) {
        clearInterval(counter);
      }
    }, interval);

    return () => clearInterval(counter);
  }, [statsInView]);

  useEffect(() => {
    const options = { threshold: 0.2 };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target;
        if (entry.isIntersecting) {
          target.classList.add("opacity-100", "translate-y-0");
          target.classList.remove("opacity-0", "translate-y-6");
        }
      });
    }, options);

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      cardRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [statsInView]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setZivaasInView(true);
        } else {
          setZivaasInView(false);
        }
      },
      { threshold: 0.3 }
    );

    if (zivaasRef.current) observer.observe(zivaasRef.current);
    return () => {
      if (zivaasRef.current) observer.unobserve(zivaasRef.current);
    };
  }, []);

  useEffect(() => {
    if (!zivaasInView) return;

    const targets = [20, 500, 100];
    const interval = 30;
    const steps = 50;
    const increments = targets.map((t) => Math.ceil(t / steps));
    let current = [0, 0, 0];

    const counter = setInterval(() => {
      current = current.map((val, i) => {
        const next = val + increments[i];
        return next >= targets[i] ? targets[i] : next;
      });

      setZivaasCounts([...current]);

      if (current.every((val, i) => val >= targets[i])) {
        clearInterval(counter);
      }
    }, interval);

    return () => clearInterval(counter);
  }, [zivaasInView]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add("opacity-100", "translate-y-0");
            el.classList.remove("opacity-0", "translate-y-6");
          }
        });
      },
      { threshold: 0.2 }
    );

    featuredRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      featuredRefs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add("opacity-100", "translate-y-0");
            el.classList.remove("opacity-0", "translate-y-6");
          }
        });
      },
      { threshold: 0.2 }
    );

    serviceRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      serviceRefs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const handleSearch = () => {
    if (searchInput.trim() !== "") {
      navigate(`/listings?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const type = (property.type || "").toLowerCase();
    const status = (property.status || "").toLowerCase();
    console.log(
      `Filtering property: ${property.name}, type: ${type}, status: ${status}, progress: ${property.progress}`
    );
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Residential")
      return ["flat", "villa", "plot"].includes(type);
    if (selectedFilter === "Commercial")
      return ["office", "shop", "commercial"].includes(type);
    if (selectedFilter === "Ready") return status === "ready";
    if (selectedFilter === "Ongoing") return status === "under construction";
    if (selectedFilter === "Upcoming")
      return status === "upcoming" && property.progress === 0;
    return true;
  });

  console.log("Filtered properties:", filteredProperties);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center text-white h-[100vh] flex items-center justify-center"
        style={{
          backgroundImage: `url(https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Bg%20img/bghome.jpg)`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60 z-0"></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="p-8 rounded-lg text-center max-w-2xl mx-auto">
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Find Your Dream Property with Zivaas
            </motion.h1>
            <motion.p
              className="text-lg mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Explore luxury flats, spacious plots, and premium upcoming
              projects across India.
            </motion.p>
            <motion.div
              className="flex flex-col md:flex-row justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Link
                to="/listings"
                className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
                  before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-white
                  before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-stone-700"
              >
                Browse Listings
              </Link>
              <Link
                to="/contact"
                className="relative inline-block px-6 py-2 rounded font-medium text-white border border-white z-10 overflow-hidden
                  before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-700
                  before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:border-none hover:text-white"
              >
                Contact Us
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-4xl text-stone-700 font-semibold mb-2 text-center">
          Featured Properties
        </h2>
        <p className="text-center text-lg text-stone-500 mb-6">
          Discover our portfolio of exceptional properties designed with
          innovation and built with precision.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {[
            "All",
            "Residential",
            "Commercial",
            "Ready",
            "Ongoing",
            "Upcoming",
          ].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full border ${
                selectedFilter === filter
                  ? "bg-stone-700 text-white"
                  : "bg-white text-stone-700"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProperties.length > 0 && !loading
            ? filteredProperties.slice(0, 6).map((property, i) => (
                <div
                  key={property.id}
                  ref={(el) => (featuredRefs.current[i] = el)}
                  className="opacity-100 translate-y-0 transition-all duration-700"
                >
                  <div className="rounded shadow hover:shadow-lg transition text-white">
                    <div className="relative group h-80 w-full overflow-hidden rounded">
                      <Link to={`/listings/${property.id}`}>
                        <img
                          src={property.image}
                          alt={property.name || "Property"}
                          className="w-full h-80 transition-transform duration-300 group-hover:scale-105 rounded"
                          onError={(e) => {
                            console.error(
                              "Failed to load property image:",
                              e.target.src
                            );
                            e.target.src =
                              "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80";
                          }}
                        />
                        <div className="absolute inset-0 bg-black opacity-40 md:opacity-0 md:group-hover:opacity-40 transition-opacity duration-300 z-0"></div>
                        <div className="absolute inset-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                          <div className="absolute bottom-4 left-4 text-left">
                            <h3 className="text-lg font-semibold">
                              {property.name || "Unnamed Property"}
                            </h3>
                            <p className="text-sm">
                              {property.location || "Unknown Location"}
                            </p>
                            <p className="text-sm">
                              {property.bhk} BHK • ₹
                              {(property.price || 0).toLocaleString()}
                            </p>
                            <p className="text-sm">
                              {property.type || "Unknown Type"} •{" "}
                              {property.status || "Unknown Status"}
                            </p>
                            <Link
                              to={`/listings/${property.id}`}
                              className="inline-block text-rose-100 hover:underline mt-1"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            : !loading && (
                <p className="text-center text-stone-600 text-lg col-span-full">
                  No properties found for the selected filter.
                </p>
              )}
          {loading && (
            <div className="col-span-full flex justify-center items-center min-h-screen h-72 w-auto">
              <img
                src="https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/logo/zivaaslogo01.jpg"
                className="h-32 w-auto object-contain animate-pulse"
              />
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8 mb-8">
          <Link
            to="/listings"
            className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
              before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600 
              before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
          >
            View All
          </Link>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="bg-stone-100 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-stone-800 mb-4">
            Our Approach: Clear & Streamlined
          </h2>
          <p className="text-lg text-stone-600">
            We guide you seamlessly from property discovery to management and
            wishlist customization.
          </p>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-stone-300 z-0 transform -translate-y-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
            <div className="bg-white p-6 rounded shadow text-center flex flex-col items-center">
              <ClipboardList className="w-10 h-10 text-stone-700 mb-3" />
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                Explore Properties
              </h3>
              <p className="text-sm text-stone-600">
                Browse verified listings tailored to your preferences and add
                them to your profile.
              </p>
            </div>
            <div className="bg-white p-6 rounded shadow text-center flex flex-col items-center">
              <CalendarDays className="w-10 h-10 text-stone-700 mb-3" />
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                Schedule Viewing
              </h3>
              <p className="text-sm text-stone-600">
                Book a visit to inspect properties in person with ease.
              </p>
            </div>
            <div className="bg-white p-6 rounded shadow text-center flex flex-col items-center">
              <MessageCircle className="w-10 h-10 text-stone-700 mb-3" />
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                Customize Wishlist
              </h3>
              <p className="text-sm text-stone-600">
                Define criteria and save preferred properties to your wishlist.
              </p>
            </div>
            <div className="bg-white p-6 rounded shadow text-center flex flex-col items-center">
              <FileCheck2 className="w-10 h-10 text-stone-700 mb-3" />
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                Manage Listings
              </h3>
              <p className="text-sm text-stone-600">
                Developers can update or delete properties with full control.
              </p>
            </div>
            <div className="bg-white p-6 rounded shadow text-center flex flex-col items-center">
              <HomeIcon className="w-10 h-10 text-stone-700 mb-3" />
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                Finalize Ownership
              </h3>
              <p className="text-sm text-stone-600">
                Complete transactions with secure documentation support.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/listings"
            className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
              before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600 
              before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
          >
            Start Exploring
          </Link>
        </div>
      </section>

      {/* Building Dreams Section */}
      <section
        ref={zivaasRef}
        className="relative md:h-100 h-[70vh] bg-cover bg-center text-white flex flex-col justify-center items-center text-center px-4"
        style={{
          backgroundImage: `url(https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Bg%20img/bghome.jpg)`,
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h1
            className="text-4xl md:text-5xl font-bold leading-tight mb-4"
            initial={{ opacity: 0, y: -50 }}
            animate={
              zivaasInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }
            }
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Building Dreams with Zivaas
          </motion.h1>

          <motion.p
            className="mb-6 text-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={
              zivaasInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Explore thoughtfully designed spaces crafted for comfort, elegance,
            and modern living.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 max-w-3xl mx-auto">
            {[
              { label: "Years of Experience", suffix: "+" },
              { label: "Happy Clients", suffix: "+" },
              { label: "Client Satisfaction", suffix: "%" },
            ].map(({ label, suffix }, i) => (
              <div
                key={i}
                className="bg-black/50 backdrop-blur-sm rounded px-6 py-4 text-white shadow-md"
              >
                <h3 className="text-3xl font-bold mb-1">
                  {zivaasCounts[i]}
                  {suffix}
                </h3>
                <p className="text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Full-Spectrum Solutions Section */}
      <section className="bg-stone-100 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-stone-800 mb-4">
            Our Full-Spectrum Solutions
          </h2>
          <p className="text-lg text-stone-600">
            We provide end-to-end support for property management and user
            preferences.
          </p>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div
              ref={(el) => (serviceRefs.current[0] = el)}
              className="bg-white p-6 rounded shadow text-center flex flex-col items-center opacity-0 translate-y-6 transition-all duration-1000"
              style={{ transitionDelay: "0ms" }}
            >
              <BookOpen className="w-12 h-12 text-stone-700 mb-4" />
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                Property Consultation
              </h3>
              <p className="text-sm text-stone-600">
                Get personalized advice to select properties and set wishlist
                criteria based on your needs.
              </p>
            </div>
            <div
              ref={(el) => (serviceRefs.current[1] = el)}
              className="bg-white p-6 rounded shadow text-center flex flex-col items-center opacity-0 translate-y-6 transition-all duration-1000"
              style={{ transitionDelay: "150ms" }}
            >
              <DollarSign className="w-12 h-12 text-stone-700 mb-4" />
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                Developer Support
              </h3>
              <p className="text-sm text-stone-600">
                Assist developers in adding, editing, and managing properties
                with detailed profiles.
              </p>
            </div>
            <div
              ref={(el) => (serviceRefs.current[2] = el)}
              className="bg-white p-6 rounded shadow text-center flex flex-col items-center opacity-0 translate-y-6 transition-all duration-1000"
              style={{ transitionDelay: "300ms" }}
            >
              <Gavel className="w-12 h-12 text-stone-700 mb-4" />
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                Legal Assistance
              </h3>
              <p className="text-sm text-stone-600">
                Handle documentation and compliance for property transactions
                and updates.
              </p>
            </div>
            <div
              ref={(el) => (serviceRefs.current[3] = el)}
              className="bg-white p-6 rounded shadow text-center flex flex-col items-center opacity-0 translate-y-6 transition-all duration-1000"
              style={{ transitionDelay: "450ms" }}
            >
              <Palette className="w-12 h-12 text-stone-700 mb-4" />
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                Property Customization
              </h3>
              <p className="text-sm text-stone-600">
                Enhance properties with image uploads and detailed amenities.
              </p>
            </div>
            <div
              ref={(el) => (serviceRefs.current[4] = el)}
              className="bg-white p-6 rounded shadow text-center flex flex-col items-center opacity-0 translate-y-6 transition-all duration-1000"
              style={{ transitionDelay: "600ms" }}
            >
              <PhoneCall className="w-12 h-12 text-stone-700 mb-4" />
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                User Support
              </h3>
              <p className="text-sm text-stone-600">
                Offer ongoing assistance for wishlist updates and property
                inquiries.
              </p>
            </div>
            <div
              ref={(el) => (serviceRefs.current[5] = el)}
              className="bg-white p-6 rounded shadow text-center flex flex-col items-center opacity-0 translate-y-6 transition-all duration-1000"
              style={{ transitionDelay: "750ms" }}
            >
              <HomeIcon className="w-12 h-12 text-stone-700 mb-4" />
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                Property Investment Guidance
              </h3>
              <p className="text-sm text-stone-600">
                Provide expert advice on investment opportunities and market
                trends to maximize returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Legacy Section */}
      <section
        id="legacy-section"
        className="text-stone-700 bg-stone-200 shadow-md py-16 px-6 opacity-0 translate-y-8 transition-all duration-1000"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
              Our Legacy of <span className="text-stone-500">Excellence</span>
            </h2>
            <p className="mb-4 text-lg">
              For over two decades, Zivaas Properties has been crafting
              exceptional living spaces that balance aesthetic beauty with
              practical functionality.
            </p>
            <p className="mb-6 text-base">
              From conceptualization to completion, we partner with our clients
              to transform their vision into reality, creating spaces that
              reflect their unique lifestyle and aspirations.
            </p>
            <Link
              to="/about"
              className="relative inline-block px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
                before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600 
                before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
            >
              Discover Our Story
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "Years of Experience", suffix: "+" },
              { label: "Projects Completed", suffix: "+" },
              { label: "Happy Clients", suffix: "+" },
              { label: "Industry Awards", suffix: "+" },
            ].map(({ label, suffix }, i) => (
              <div
                key={i}
                ref={(el) => (cardRefs.current[i] = el)}
                className="bg-white rounded shadow p-6 text-center opacity-0 translate-y-6 transition-all duration-1000"
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="text-3xl font-bold text-stone-800 mb-2">
                  {counts[i]}
                  {suffix}
                </div>
                <p className="text-sm font-medium text-stone-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-stone-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-stone-800">
            What our Clients say!
          </h2>
        </div>

        <div
          ref={scrollRef}
          className="overflow-x-auto [&::-webkit-scrollbar]:hidden scrollbar-hide"
        >
          <div className="flex gap-6 px-4 sm:px-8 lg:px-20 pb-4 w-max">
            {[
              {
                name: "John Doe",
                image: "https://i.pravatar.cc/100?img=10",
                feedback:
                  "I knew I was going to get great service, but Zivaas went above and beyond my expectations.",
              },
              {
                name: "Asa Walter",
                image: "https://i.pravatar.cc/100?img=12",
                feedback:
                  "This is the best thing that happened to my small business. They rebranded and revamped my company in no time.",
              },
              {
                name: "Zahid Miles",
                image: "https://i.pravatar.cc/100?img=14",
                feedback:
                  "They are great. They did exactly what I needed. The friendly chaps are real problem solvers. Loved working with them.",
              },
              {
                name: "Casper Leigh",
                image: "https://i.pravatar.cc/100?img=16",
                feedback:
                  "Awesome services. I'm really happy to be here because of their services. I will continue to use them in the future.",
              },
              {
                name: "Cian Roy",
                image: "https://i.pravatar.cc/100?img=18",
                feedback:
                  "By far the best experience I've had. The team is efficient, kind, and very knowledgeable!",
              },
            ].map(({ name, image, feedback }, i) => (
              <div
                key={i}
                className="min-w-[300px] max-w-sm bg-white rounded-2xl shadow-md px-6 py-8 flex flex-col items-center text-center hover:shadow-xl transition duration-300"
              >
                <img
                  src={image}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover mb-4"
                />
                <h4 className="text-stone-800 font-semibold mb-3">{name}</h4>
                <p className="text-sm text-stone-600 italic leading-relaxed">
                  “{feedback}”
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reach Out – Your Trusted Real Estate Allies Section */}
      <section className="bg-stone-100 text-stone-800 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Reach Out – Your Trusted Real Estate Allies
          </h2>
          <p className="text-lg text-stone-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            At{" "}
            <span className="font-semibold text-stone-800">
              Zivaas Properties
            </span>
            , we support developers in managing properties and users in curating
            wishlists with expert guidance. With over{" "}
            <strong>15 years of experience</strong> in India, our team ensures
            top-notch service from listing to ownership.
          </p>

          <h3 className="text-2xl font-semibold mb-10">
            Frequently Asked Questions
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-md border border-stone-200 p-6 text-left transform transition-transform duration-300 hover:-translate hover:shadow-xl">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-stone-700 text-xl">📤</span>
                <h4 className="font-semibold text-lg">
                  How do I add a property as a developer?
                </h4>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                Log in to your profile, fill out the property details, and
                upload images to list it.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-md border border-stone-200 p-6 text-left transform transition-transform duration-300 hover:-translate hover:shadow-xl">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-stone-700 text-xl">📋</span>
                <h4 className="font-semibold text-lg">
                  What details are required for a property?
                </h4>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                Name, location, price, area, type, and status are mandatory
                fields.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-md border border-stone-200 p-6 text-left transform transition-transform duration-300 hover:-translate hover:shadow-xl">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-stone-700 text-xl">📞</span>
                <h4 className="font-semibold text-lg">
                  How can I contact support?
                </h4>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                Reach us via phone or email with your query details.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
