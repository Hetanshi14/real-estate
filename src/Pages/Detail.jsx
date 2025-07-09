import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

const Carousel = ({ property, images }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = images.length || 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  const fallbackImages = [
    {
      src: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=500&q=80',
      alt: property?.name || 'Property Exterior',
    },
    {
      src: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=500&q=80',
      alt: 'Lobby View',
    },
    {
      src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=500&q=80',
      alt: 'Apartment View',
    },
  ];

  const slides = images.length > 0 ? images : fallbackImages;

  return (
    <motion.section
      className="relative h-[80vh] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="min-w-full h-full relative">
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                console.error(`Failed to load image: ${slide.src}`);
                e.target.src = fallbackImages[0].src;
              }}
            />
            <div className="absolute inset-0 bg-black/60 z-0"></div>
          </div>
        ))}
      </div>
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 transition-all"
      >
        <i className="ri-arrow-left-line text-xl text-gray-900"></i>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 transition-all"
      >
        <i className="ri-arrow-right-line text-xl text-gray-900"></i>
      </button>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full bg-white transition-all ${currentSlide === index ? 'bg-opacity-100' : 'bg-opacity-60'
              }`}
          ></button>
        ))}
      </div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-center text-white z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="px-4 max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">{property?.name}</h1>
          <p className="text-xl md:text-2xl max-w-xl mx-auto">{property?.developer_tagline}</p>
          <p className="text-lg opacity-90">{property?.location}</p>
        </div>
      </motion.div>
    </motion.section>
  );
};

const EMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTenure, setLoanTenure] = useState("");
  const [emiData, setEmiData] = useState({
    monthlyEMI: 0,
    totalInterest: 0,
    totalAmount: 0
  });
  const [error, setError] = useState("");

  const calculateEMI = () => {
    setError(""); // Clear previous errors

    // Validate inputs
    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const years = parseFloat(loanTenure);

    if (!loanAmount || !interestRate || !loanTenure) {
      setError("Please fill in all fields.");
      setEmiData({ monthlyEMI: 0, totalInterest: 0, totalAmount: 0 });
      return;
    }

    if (isNaN(principal) || isNaN(annualRate) || isNaN(years) || principal <= 0 || annualRate <= 0 || years <= 0) {
      setError("Please enter valid positive numbers for all fields.");
      setEmiData({ monthlyEMI: 0, totalInterest: 0, totalAmount: 0 });
      return;
    }

    const monthlyRate = annualRate / (12 * 100);
    const months = years * 12;

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const totalAmount = emi * months;
    const totalInterest = totalAmount - principal;

    setEmiData({
      monthlyEMI: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalAmount: Math.round(totalAmount)
    });
  };

  useEffect(() => {
    if (loanAmount && interestRate && loanTenure) {
      calculateEMI();
    } else {
      setEmiData({ monthlyEMI: 0, totalInterest: 0, totalAmount: 0 });
    }
  }, [loanAmount, interestRate, loanTenure]);

  return (
    <motion.section
      className="py-12 bg-stone-50"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">EMI Calculator</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Loan Amount (₹)</label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter loan amount"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Interest Rate (% per annum)</label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  step="0.1"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter interest rate"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Loan Tenure (Years)</label>
                <input
                  type="number"
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter loan tenure"
                  min="0"
                />
              </div>
              <button
                onClick={calculateEMI}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Calculate EMI
              </button>
            </div>
            <div className="bg-stone-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-stone-700 mb-4">EMI Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-stone-600">Monthly EMI</span>
                  <span className="text-xl font-bold text-blue-500">
                    {emiData.monthlyEMI ? `₹${emiData.monthlyEMI.toLocaleString('en-IN')}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-stone-600">Total Interest</span>
                  <span className="text-lg font-semibold text-stone-700">
                    {emiData.totalInterest ? `₹${emiData.totalInterest.toLocaleString('en-IN')}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-stone-600">Total Amount</span>
                  <span className="text-lg font-semibold text-stone-700">
                    {emiData.totalAmount ? `₹${emiData.totalAmount.toLocaleString('en-IN')}` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        console.log('Fetching property with ID:', id);
        // Fetch property data
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (propertyError) {
          console.error('Property fetch error:', propertyError.message);
          throw new Error('Failed to fetch property details.');
        }
        console.log('Fetched property:', propertyData);
        console.log('Amenities:', propertyData?.amenities);
        setProperty(propertyData);

        // Fetch images
        const { data: imageData, error: imageError } = await supabase.storage
          .from('property-images')
          .list(`${id}/`, { limit: 10, offset: 0 });

        if (imageError) {
          console.warn('Image fetch error:', imageError.message);
        }

        const imageUrls = imageData && imageData.length > 0
          ? imageData.map((file) => ({
            src: supabase.storage.from('property-images').getPublicUrl(`${id}/${file.name}`).data.publicUrl,
            alt: `${propertyData.name || 'Property'} - Image ${file.name}`,
          }))
          : [];
        console.log('Image URLs:', imageUrls);
        setImages(imageUrls);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching property:', error.message);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-stone-700">Loading...</div>;
  if (error || !property) return <div className="min-h-screen flex items-center justify-center text-red-700">{error || 'Property not found'}</div>;

  const amenityIcons = {
    '24/7 Security': 'ri-shield-check-line',
    'Lift': 'ri-elevator-line',
    'Parking': 'ri-parking-box-line',
    'Garden': 'ri-leaf-line',
    'Swimming Pool': 'ri-swim-line',
    'Gym': 'ri-dumbbell-line',
    'Clubhouse': 'ri-community-line',
    'CCTV Surveillance': 'ri-camera-line',
    'Childrens Play Area': 'ri-playground-line',
    'Mini Theater Room': 'ri-film-line',
    'Power Backup': 'ri-battery-line',
    'Motion Sensor Lighting': 'ri-lightbulb-line',
    'Indoor Games Room': 'ri-gamepad-line',
    'Fire Safety Systems': 'ri-fire-line',
    'Smart Lock Access': 'ri-lock-line',
    'Home Theater Room': 'ri-film-line',
    'Private Garden Seating Area': 'ri-leaf-line',
    'Rooftop Garden': 'ri-leaf-line',
    'Air Conditioning in all Rooms': 'ri-air-conditioner-line',
    'CCTV': 'ri-camera-line',
    'Gated Entry': 'ri-gate-line',
    'Park Area': 'ri-leaf-line',
    'Security Guard': 'ri-shield-check-line',
    'Rainwater Harvesting': 'ri-water-flash-line',
    'Terrace/Balcony Sit-out': 'ri-home-5-line',
    'Video Door Phone': 'ri-video-line',
    'Wi-Fi': 'ri-wifi-line',
    'Backup Generator': 'ri-battery-line',
    'Basement Parking': 'ri-parking-box-line',
    'Main Road Facing': 'ri-road-map-line',
    'Outdoor Seating Space': 'ri-home-5-line',
    'Double Height Ceiling': 'ri-building-line',
    'Visitor Parking': 'ri-parking-box-line',
    'Multiple Showroom Floors': 'ri-building-4-line',
  };

  return (
    <div className="min-h-screen">
      <section className="pt-16">
        <Carousel property={property} images={images} />
      </section>

      <motion.section
        className="sticky top-16 bg-white shadow-md z-40"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4 text-center">
            <div className="p-3">
              <div className="text-lg font-bold text-blue-500">₹{property.price.toLocaleString('en-IN')}</div>
              <div className="text-sm text-stone-600">Price</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-blue-500">{property.carpet_area} sq.ft</div>
              <div className="text-sm text-stone-600">Carpet Area</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-blue-500">{property.configuration}</div>
              <div className="text-sm text-stone-600">Configuration</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-blue-500">{property.property_type}</div>
              <div className="text-sm text-stone-600">Property Type</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-blue-500">{property.total_floors} Floors</div>
              <div className="text-sm text-stone-600">Total Floors</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-blue-500">{property.total_units} Units</div>
              <div className="text-sm text-stone-600">Total Units</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-yellow-500">{property.status}</div>
              <div className="text-sm text-stone-600">Status</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-blue-500">{property.rera_number}</div>
              <div className="text-sm text-stone-600">RERA Number</div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-12 bg-stone-50"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">Project Overview</h2>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                {property.name} stands as a testament to modern architectural excellence in the heart of {property.location}. This premium residential project offers a perfect blend of luxury, comfort, and convenience, designed for the discerning urban dweller.
              </p>
              <p className="text-lg text-stone-700 mb-6 leading-relaxed">
                With meticulously planned {property.configuration} apartments, {property.name} provides spacious living spaces that cater to contemporary lifestyle needs. The project features world-class amenities and is strategically located to offer excellent connectivity to major IT hubs and commercial centers.
              </p>
              <h3 className="text-xl font-bold text-stone-700 mb-4">Key Highlights</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <i className="ri-check-line text-blue-500 mr-2 text-xl"></i>
                  <span className="text-stone-700">Prime location in {property.location} with excellent connectivity</span>
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-blue-500 mr-2 text-xl"></i>
                  <span className="text-stone-700">{property.total_floors}-floor tower with panoramic city views</span>
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-blue-500 mr-2 text-xl"></i>
                  <span className="text-stone-700">Premium amenities including clubhouse and swimming pool</span>
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-blue-500 mr-2 text-xl"></i>
                  <span className="text-stone-700">RERA approved project with transparent pricing</span>
                </li>
                <li className="flex items-center">
                  <i className="ri-check-line text-blue-500 mr-2 text-xl"></i>
                  <span className="text-stone-700">{property.status} with immediate possession available</span>
                </li>
              </ul>
            </div>
            <div>
              <img
                src={images.length > 0 ? images[0].src : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'}
                alt="Apartment Interior"
                className="w-full rounded-lg shadow-md object-cover object-center"
                onError={(e) => {
                  console.error('Failed to load overview image:', e.target.src);
                  e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&h=400&q=80';
                }}
              />
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-12 bg-white"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">World-Class Amenities</h2>
          <p className="text-lg text-stone-600 mb-6 text-center">Experience luxury living with our comprehensive range of amenities</p>
          {property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {property.amenities.map((amenity, index) => (
                <div key={index} className="bg-stone-50 p-4 rounded-lg text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className={`${amenityIcons[amenity] || 'ri-building-line'} text-xl text-blue-500`}></i>
                  </div>
                  <h3 className="font-semibold text-stone-700">{amenity}</h3>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-stone-600 text-lg">No amenities available for this property.</p>
          )}
        </div>
      </motion.section>

      <motion.section
        className="py-12 bg-stone-50"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">About the Developer</h2>
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mr-3">
                    <i className="ri-building-4-line text-xl text-blue-500"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-700">{property.developer_name}</h3>
                    <p className="text-stone-600">{property.developer_tagline}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-500">{property.developer_experience}+</div>
                    <div className="text-sm text-stone-600">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-500">{property.developer_projects_completed}+</div>
                    <div className="text-sm text-stone-600">Projects Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-500">{property.developer_happy_families.toLocaleString('en-IN')}+</div>
                    <div className="text-sm text-stone-600">Happy Families</div>
                  </div>
                </div>
                <p className="text-stone-700 leading-relaxed">
                  {property.developer_name} has been a trusted name in the real estate landscape for over {property.developer_experience} years. With a commitment to quality construction, timely delivery, and customer satisfaction, we have successfully delivered premium residential and commercial projects.
                </p>
              </div>
              <div>
                
                <img
                      src={property.image}
                      alt={property.name || 'Property'}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105 rounded"
                      onError={(e) => {
                        console.error('Failed to load property image:', e.target.src);
                        e.target.src =
                          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
                      }}
                    />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-12 bg-white"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">Prime Location</h2>
          <p className="text-lg text-stone-600 mb-6 text-center">Strategically located in {property.location} with excellent connectivity</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-stone-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-stone-700 mb-4">Nearby Landmarks</h3>
                <div className="space-y-3">
                  {property.nearby_landmarks?.landmarks?.map((landmark, index) => (
                    <div key={index} className="flex items-center">
                      <i className="ri-map-pin-line text-blue-500 mr-2"></i>
                      <span className="text-stone-700">{landmark.name} ({landmark.distance})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-1 rounded shadow">
              <h3 className="text-xl font-bold mb-2 flex justify-center text-white">Location on Map</h3>
              <iframe
                title="Google Map"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${property.location}&output=embed`}
              />
            </div>

          </div>
        </div>
      </motion.section>

      <EMICalculator />

      <motion.section
        className="py-12 bg-stone-50"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-stone-700 mb-6 text-center">Contact Us</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-center mb-6">
                <img
                  src={property.agent_photo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80'}
                  alt={property.agent_name}
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover object-center"
                  onError={(e) => {
                    console.error('Failed to load agent image:', e.target.src);
                    e.target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80';
                  }}
                />
                <h3 className="text-lg font-bold text-stone-700">{property.agent_name}</h3>
                <p className="text-stone-600">{property.agent_role}</p>
                <div className="flex items-center justify-center mt-2">
                  <div className="flex text-yellow-500">
                    {Array(Math.round(property.agent_rating)).fill().map((_, i) => (
                      <i key={i} className="ri-star-fill"></i>
                    ))}
                    {Array(5 - Math.round(property.agent_rating)).fill().map((_, i) => (
                      <i key={i} className="ri-star-line"></i>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-stone-600">{property.agent_rating} ({property.agent_reviews} reviews)</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <i className="ri-phone-line text-blue-500 mr-2"></i>
                  <span className="text-stone-700">{property.agent_phone}</span>
                </div>
                <div className="flex items-center">
                  <i className="ri-mail-line text-blue-500 mr-2"></i>
                  <span className="text-stone-700">{property.agent_email}</span>
                </div>
                <div className="flex items-center">
                  <i className="ri-time-line text-blue-500 mr-2"></i>
                  <span className="text-stone-700">Available: {property.agent_availability}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                  <i className="ri-phone-line mr-2"></i>
                  Call Now
                </button>
                <button className="border border-blue-500 text-blue-500 py-2 px-4 rounded-lg font-semibold hover:bg-blue-500 hover:text-white transition-colors">
                  <i className="ri-message-line mr-2"></i>
                  Message
                </button>
              </div>
            </div>
            <div className="bg-blue-500/5 rounded-lg p-6">
              <h3 className="text-xl font-bold text-stone-700 mb-4">Book a Site Visit</h3>
              <p className="text-stone-600 mb-4">Experience {property.name} in person. Schedule your visit today!</p>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <textarea
                  placeholder="Special Requirements (Optional)"
                  rows="3"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Book Site Visit
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.section>

    </div>
  );
};

export default Detail;
