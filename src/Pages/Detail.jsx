import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

const EMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTenure, setLoanTenure] = useState("");
  const [emiData, setEmiData] = useState({
    monthlyEMI: 0,
    totalInterest: 0,
    totalAmount: 0,
  });
  const [error, setError] = useState("");

  const calculateEMI = () => {
    setError("");
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
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalAmount = emi * months;
    const totalInterest = totalAmount - principal;

    setEmiData({
      monthlyEMI: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalAmount: Math.round(totalAmount),
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
                className="relative inline-block w-full py-3 px-6 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white transition-colors"
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

const Details = () => {
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
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select(
            `
            id,
            name,
            property_type,
            images,
            price,
            location,
            status,
            configuration,
            carpet_area,
            total_floors,
            total_units,
            rera_number,
            amenities,
            developer_name,
            developer_tagline,
            developer_experience,
            developer_projects_completed,
            developer_happy_families,
            nearby_landmarks,
            agent_name,
            agent_role,
            agent_phone,
            agent_email,
            agent_availability,
            agent_rating,
            agent_reviews,
            agents_image,
            builder_id,
            builders (
              id,
              name,
              logo_url
            )
          `
          )
          .eq('id', id)
          .single();

        if (propertyError) {
          console.error('Property fetch error:', propertyError.message);
          throw new Error('Failed to fetch property details: ' + propertyError.message);
        }

        console.log('Fetched property:', propertyData);
        if (!propertyData) {
          throw new Error('Property not found');
        }

        const normalizedAmenities = Array.isArray(propertyData.amenities)
          ? propertyData.amenities
            .map((amenity) => {
              if (typeof amenity !== 'string' || !amenity) return null;
              const trimmed = amenity.trim();
              return trimmed
                .toLowerCase()
                .replace(/(^|\s)\w/g, (char) => char.toUpperCase());
            })
            .filter((amenity) => amenity !== null)
          : [];
        console.log('Raw amenities:', propertyData.amenities);
        console.log('Normalized amenities:', normalizedAmenities);

        const mappedProperty = {
          ...propertyData,
          builder_name: propertyData.builders?.name || propertyData.developer_name || 'Unknown Developer',
          builder_logo: propertyData.builders?.logo_url || '',
          amenities: normalizedAmenities,
        };
        setProperty(mappedProperty);

        const imageUrls = Array.isArray(propertyData.images) && propertyData.images.length > 0
          ? propertyData.images.map((url, index) => ({
            src: url,
            alt: `${propertyData.name || 'Property'} - Image ${index + 1}`,
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
  if (error || !property) return (
    <div className="min-h-screen flex items-center justify-center text-red-700 flex-col">
      <p>{error || 'Property not found'}</p>
      <button
        onClick={() => navigate('/listings')}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
      >
        Back to Listings
      </button>
    </div>
  );

  const amenityImages = {
    '24/7 Security': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//24-7%20security.png',
    'Lift': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//lift.png',
    'Parking': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//parking.png',
    'Garden': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//garden.jpeg',
    'Swimming Pool': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//swimming%20pool.jpeg',
    'Gym': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//gym.png',
    'Clubhouse': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//clubhouse.png',
    'Cctv Surveillance': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//cctv%20survelliance.png',
    'Childrens Play Area': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//children%20play%20area.png',
    'Mini Theater Room': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//mini%20theator.png',
    'Power Backup': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//power%20backup.png',
    'Motion Sensor Lighting': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//motion%20sensor.png',
    'Indoor Games Room': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//indoor%20games%20room.png',
    'Fire Safety Systems': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//fire%20safety%20systems.png',
    'Smart Lock Access': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//smart%20lock%20access.png',
    'Home Theater Room': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Home%20Theater%20Room.png',
    'Private Garden Seating Area': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Private%20Garden%20Seating%20Area.jpeg',
    'Rooftop Garden': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Rooftop%20Garden.png',
    'Air Conditioning In All Rooms': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Air%20Conditioning%20In%20All%20Rooms.jpeg',
    'Cctv': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//cctv.png',
    'Gated Entry': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Gated%20Entry.png',
    'Park Area': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Park%20Area.png',
    'Security Guard': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Security%20Guard.png',
    'Rainwater Harvesting': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Rainwater%20Harvesting.jpeg',
    'Terrace/Balcony Sit-Out': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Terrace-Balcony%20Sit-Out.png',
    'Video Door Phone': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Video%20Door%20Phone.png',
    'Wi-Fi': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Wi-Fi.png',
    'Backup Generator': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Backup%20Generator.png',
    'Basement Parking': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Basement%20Parking.png',
    'Main Road Facing': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Main%20Road%20Facing.png',
    'Outdoor Seating Space': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Outdoor%20Seating%20Space.png',
    'Double Height Ceiling': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Double%20Height%20Ceiling.png',
    'Visitor Parking': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Visitor%20Parking.png',
    'Multiple Showroom Floors': 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//Multiple%20Showroom%20Floors.png',
  };

  return (
    <div className="min-h-screen">
      <section className="relative">
  <motion.div
    className="relative h-[100vh] overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6 }}
  >
    <img
      src={property.images}
      alt={property.name || 'Property Exterior'}
      className="w-full h-full object-cover object-center"
      onError={(e) => {
        console.error('Failed to load hero image:', e.target.src);
        e.target.src =
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&h=500&q=80';
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
        <h1 className="text-3xl md:text-5xl font-bold mb-3">{property.name}</h1>
        <p className="text-xl md:text-2xl max-w-xl mx-auto">{property.developer_tagline || 'Premium Living'}</p>
        <p className="text-lg opacity-90">{property.location}</p>
      </div>
    </motion.div>
  </motion.div>
</section>


      <motion.section
        className="sticky top-16 bg-white shadow-md z-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4 text-center">
            <div className="p-3">
              <div className="text-lg font-bold text-stone-700">₹{property.price.toLocaleString('en-IN')}</div>
              <div className="text-sm text-stone-600">Price</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-stone-700">{property.carpet_area} sq.ft</div>
              <div className="text-sm text-stone-600">Carpet Area</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-stone-700">{property.configuration}</div>
              <div className="text-sm text-stone-600">Configuration</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-stone-700">{property.property_type}</div>
              <div className="text-sm text-stone-600">Type</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-stone-700">{property.total_floors} Floors</div>
              <div className="text-sm text-stone-600">Total Floors</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-stone-700">{property.total_units} Units</div>
              <div className="text-sm text-stone-600">Total Units</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-stone-900">{property.status}</div>
              <div className="text-sm text-stone-600">Status</div>
            </div>
            <div className="p-3">
              <div className="text-lg font-bold text-stone-700">{property.rera_number}</div>
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
          <h2 className="text-4xl font-bold text-stone-700 mb-6">Project Overview</h2>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-lg text-stone-700 mb-3 leading-relaxed">
                {property.name} stands as a testament to modern architectural excellence in the heart of {property.location}. This premium residential project offers a perfect blend of luxury, comfort, and convenience, designed for discerning urban dwellers.
              </p>
              <p className="text-lg text-stone-700 mb-6 leading-relaxed">
                With meticulously planned {property.configuration} apartments, {property.name} provides spacious living spaces that cater to modern lifestyles. The project features world-class amenities and is strategically located for excellent connectivity to major IT hubs and commercial centers.
              </p>
              <h3 className="text-xl font-bold text-stone-700 mb-4">Key Highlights</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <i className="ri-checkbox-line text-stone-700 mr-2 text-xl"></i>
                  <span className="text-stone-700">Prime location in {property.location} with excellent connectivity</span>
                </li>
                <li className="flex items-center">
                  <i className="ri-checkbox-line text-stone-700 mr-2 text-xl"></i>
                  <span className="text-stone-700">{property.total_floors}-floor tower with panoramic city views</span>
                </li>
                <li className="flex items-center">
                  <i className="ri-checkbox-line text-stone-700 mr-2 text-xl"></i>
                  <span className="text-stone-700">Premium amenities including clubhouse and swimming pool</span>
                </li>
                <li className="flex items-center">
                  <i className="ri-checkbox-line text-stone-700 mr-2 text-xl"></i>
                  <span className="text-stone-700">RERA approved project with transparent pricing</span>
                </li>
                <li className="flex items-center">
                  <i className="ri-checkbox-line text-stone-700 mr-2 text-xl"></i>
                  <span className="text-stone-700">{property.status} with immediate possession available</span>
                </li>
              </ul>
            </div>
            <div>
              <img
                src={images.length > 0 ? images[0].src : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'}
                alt={property.name}
                className="max-w-full rounded-lg shadow-md object-cover object-center"
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
          <p className="text-lg text-stone-600 mb-6 text-center">Explore the premium facilities available at {property.name}</p>
          {Array.isArray(property.amenities) && property.amenities.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {property.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="bg-stone-50 p-4 rounded-lg text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <img
                      src={amenityImages[amenity] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=32&h=32'}
                      alt={`${amenity} icon`}
                      className="w-16 h-16 mr-3 object-cover object-center rounded-full"
                      onError={(e) => {
                        console.error('Failed to load amenity image:', e.target.src);
                        e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=32&h=32';
                      }}
                    />
                  </div>
                  <h3 className="font-semibold text-stone-700 text-sm">{amenity}</h3>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-stone-500 text-lg">No amenities available for this property.</p>
          )}
        </div>
      </motion.section>


      <motion.section
        className="py-12 bg-stone-50"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-stone-700 mb-6">About the Developer</h2>
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mr-4">
                    <i className="ri-building-line text-black text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-700">{property.builder_name}</h3>
                    <p className="text-stone-600">{property.developer_tagline || 'Building Quality Homes'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-stone-700">{property.developer_experience || 0}+</div>
                    <div className="text-sm text-stone-600">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-stone-700">{property.developer_projects_completed || 0}+</div>
                    <div className="text-sm text-stone-600">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-stone-700">{(property.developer_happy_families || 0).toLocaleString('en-IN')}+</div>
                    <div className="text-sm text-stone-600">Happy Families</div>
                  </div>
                </div>
                <p className="text-stone-700 leading-relaxed">
                  {property.builder_name} has been a trusted name in real estate for over {property.developer_experience || 0} years. With a commitment to quality construction, timely delivery, and customer satisfaction, we have successfully delivered premium residential and commercial projects.
                </p>
              </div>
              <div>
                <img
                  src={images.length > 0 ? images[0].src : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80'}
                  alt={property.name || 'Property'}
                  className="w-full h-64 object-cover rounded"
                  onError={(e) => {
                    console.error('Failed to load developer image:', e.target.src);
                    e.target.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&h=300&q=80';
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
                      <i className="ri-map-pin-line text-stone-700 mr-2"></i>
                      <span className="text-stone-700">{landmark.name} ({landmark.distance})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-1 rounded shadow">
              <h3 className="text-xl font-bold mb-2 flex justify-center text-stone-700">Location on Map</h3>
              <iframe
                title="Google Map"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${property.location}&output=embed`} />
            </div>

          </div>
        </div>
      </motion.section>

      <EMICalculator />

      <motion.section
        className="py-12 bg-stone-50"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-stone-700 mb-6">Contact Us</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <img
                  src={property.agents_image?.[0] || 'https://images.unsplash.com/photo-1507003211168-6f7c6f1b6f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80'}
                  alt={property.agent_name || 'Agent'}
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover object-center"
                  onError={(e) => {
                    console.error('Failed to load agent image:', e.target.src);
                    e.target.src = 'https://images.unsplash.com/photo-1507003211168-6f7c6f1b6f1?auto=format&fit=crop&w=150&h=150&q=80';
                  }}
                />
                <h3 className="text-lg font-bold text-stone-700">{property.agent_name || 'N/A'}</h3>
                <p className="text-stone-600 text-sm">{property.agent_role || 'Agent'}</p>
                <div className="flex items-center justify-center mt-2">
                  <div className="flex text-stone-500">
                    {property.agent_rating ? (
                      <>
                        {Array(Math.round(property.agent_rating)).fill().map((_, i) => (
                          <i key={i} className="ri-star-fill text-sm"></i>
                        ))}
                        {Array(5 - Math.round(property.agent_rating)).fill().map((_, i) => (
                          <i key={i} className="ri-star-line text-sm"></i>
                        ))}
                      </>
                    ) : (
                      <span className="text-stone-600 text-sm">No rating</span>
                    )}
                  </div>
                  <span className="ml-2 text-sm text-stone-600">
                    {property.agent_rating || 0} ({property.agent_reviews || 0} reviews)
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <i className="ri-phone-line text-stone-700 mr-2"></i>
                  <span className="text-stone-700">{property.agent_phone || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <i className="ri-mail-line text-stone-700 mr-2"></i>
                  <span className="text-stone-700">{property.agent_email || 'N/A'}</span>
                </div>
                {property.agent_availability && (
                  <div className="flex items-center">
                    <i className="ri-time-line text-stone-700 mr-2"></i>
                    <span className="text-stone-700">Available: {property.agent_availability}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button className="relative inline-block py-2 px-4 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white transition-colors">
                  <i className="ri-phone-line mr-2"></i>
                  Call Now
                </button>
                <button className="relative inline-block py-2 px-4 rounded-lg font-semibold text-stone-600 border border-stone-600 z-10 overflow-hidden
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white transition-colors">
                  <i className="ri-message-line mr-2"></i>
                  Message
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-stone-700 mb-4">Book a Free Site Visit</h3>
              <p className="text-stone-600 mb-4">Experience {property.name} in person. Schedule your visit today!</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
                />
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
                />
                <textarea
                  placeholder="Special Requirements (Optional)"
                  rows="3"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
                ></textarea>
                <button
                  className="relative inline-block w-full py-3 px-6 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white transition-colors"
                >
                  Book Site Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Details;
