import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const PropertyDetails = () => {
    const { developerName } = useParams();
    const [properties, setProperties] = useState([]);
    const [error, setError] = useState(null);
    const [developerImage, setDeveloperImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const sectionRefs = useRef([]);

    // Placeholder isVisible function (replace with your actual implementation)
    const isVisible = (sectionId) => {
        const section = sectionRefs.current.find((ref, index) => index === 0); // Adjust based on your logic
        return section ? section.getBoundingClientRect().top < window.innerHeight && section.getBoundingClientRect().bottom > 0 : false;
    };

    useEffect(() => {
        const fetchDeveloperProperties = async () => {
            setLoading(true);
            try {
                const { data, error: fetchError } = await supabase
                    .from('properties')
                    .select(`
            id, name, location, price, carpet_area, configuration, property_type, total_floors,
            total_units, status, rera_number, amenities, developer_name, developer_tagline,
            developer_experience, developer_projects_completed, developer_happy_families,
            nearby_landmarks, developer_awards, developer_certifications, developer_description,
            images, developer_image
          `)
                    .eq('developer_name', decodeURIComponent(developerName));

                if (fetchError) {
                    throw new Error(`Failed to fetch properties: ${fetchError.message}`);
                }

                if (!data || data.length === 0) {
                    setProperties([]);
                    setError('No properties found for this developer.');
                    return;
                }

                const firstProperty = data[0];
                // Use developer_image if available and non-empty
                const developerImg = firstProperty.developer_image && firstProperty.developer_image.trim() !== ''
                    ? firstProperty.developer_image
                    : null;
                setDeveloperImage(developerImg);

                const mappedProperties = data.map((p) => ({
                    id: p.id,
                    name: p.name || 'Unnamed Property',
                    type: p.property_type || 'Unknown',
                    bhk: p.configuration ? parseInt(p.configuration) || 0 : 0,
                    price: p.price ? parseFloat(p.price) : 0,
                    location: p.location || 'Unknown',
                    status: p.status || 'Unknown',
                    floors: p.total_floors || 'N/A',
                    units: p.total_units || 'N/A',
                    carpetArea: p.carpet_area || 0,
                    reraNumber: p.rera_number || 'N/A',
                    amenities: Array.isArray(p.amenities) ? p.amenities : p.amenities ? p.amenities.split(',') : [],
                    image: p.images && p.images.trim() !== '' ? p.images.split(',')[0] : null,
                    developer: p.developer_name || 'Unknown Developer',
                    tagline: p.developer_tagline || 'No tagline',
                    experience: p.developer_experience || 0,
                    projectsCompleted: p.developer_projects_completed || 0,
                    happyFamilies: p.developer_happy_families || 0,
                    landmarks: p.nearby_landmarks || 'N/A',
                    awards: p.developer_awards || 'None',
                    certifications: p.developer_certifications || 'None',
                    description: p.developer_description || 'No description available.',
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

    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div
            className="min-h-screen bg-gray-50 relative transition-opacity duration-600"
            style={{ opacity: 1, transform: 'translateY(0)' }}
        >
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-4xl mx-auto mb-8 text-center relative z-10">
                    {error}
                </div>
            )}
            {properties.length > 0 && (
                <div>
                    {/* Top Background Image Section */}
                    <section
                        id="section1"
                        ref={(el) => (sectionRefs.current[0] = el)}
                        className={`relative bg-cover bg-center text-white h-[80vh] flex items-center p-20 transition-all duration-1000 transform ${isVisible('section1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                        style={{ backgroundImage: `url('https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Bg%20img/bgdev1.jpg')` }}
                    >
                        <div className="absolute inset-0 bg-black/60 z-0" />
                        <div className="relative z-10 px-4 max-w-6xl mx-auto">
                            <h1 className="text-3xl md:text-5xl font-bold mb-3 transition-opacity duration-600" style={{ opacity: 1 }}>
                                {properties[0].developer}
                            </h1>
                            <p className="text-2xl max-w-xl mx-auto transition-opacity duration-600" style={{ opacity: 1 }}>
                                {properties[0].description || 'No description available.'}
                            </p>
                        </div>
                    </section>

                    {/* Hero Section - Developer Info */}
                    <div
                        id="section2"
                        ref={(el) => (sectionRefs.current[1] = el)}
                        className="p-6 flex flex-col md:flex-row items-center text-stone-700 relative z-10 transition-opacity duration-600"
                        style={{ opacity: 1, transform: 'translateY(0)' }}
                    >
                        {/* Developer Image - Left Top */}
                        <div className="w-full md:w-1/3 mb-4 md:mb-0">
                            <div className="relative w-2xs h-80 shadow-md bg-gray-200 rounded overflow-hidden">
                                {developerImage ? (
                                    <img
                                        src={developerImage || 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//default.jpg'}
                                        alt={`${properties[0].developer}`}
                                        className="w-2xs rounded"
                                        onError={(e) => {
                                            e.target.src = 'https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//default.jpg';
                                            e.target.style.display = 'block'; // Ensure the image is visible
                                            setError('Failed to load developer image, using default.');
                                        }}
                                    />
                                ) : (
                                    <img
                                        src="https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images//default.jpg"
                                        alt={`${properties[0].developer} logo`}
                                        className="w-2xs h-80 rounded"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Developer Details - Right Top */}
                        <div className="w-full md:w-2/3 md:pl-6">
                            <h1 className="text-4xl font-bold">{properties[0].developer}</h1>
                            <p className="text-lg mt-2 italic">{properties[0].tagline || 'No tagline'}</p>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p><strong>Awards:</strong> {properties[0].awards}</p>
                                </div>
                                <div>
                                    <p><strong>Certifications:</strong> {properties[0].certifications}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Properties Section */}
                    <div
                        id="section3"
                        ref={(el) => (sectionRefs.current[2] = el)}
                        className="p-6 relative z-10 transition-opacity duration-600"
                        style={{ opacity: 1, transform: 'translateY(0)' }}
                    >
                        <h2 className="text-3xl text-center font-semibold text-stone-800 mb-8">Developer Property Name</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                            {properties.map((prop) => (
                                <div
                                    key={prop.id}
                                    className="relative bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="p-4">
                                        <h3 className="text-xl font-semibold text-stone-800 mb-2">{prop.name}</h3>
                                        <p className="text-sm text-stone-600 mb-1">Location: {prop.location}</p>
                                        <p className="text-sm text-stone-600 mb-1">BHK: {prop.bhk ? `${prop.bhk} BHK` : 'N/A'}</p>
                                        <p className="text-sm text-stone-600 mb-1">Price: ₹{prop.price.toLocaleString()}</p>
                                        <p className="text-sm text-stone-600 mb-1">Type: {prop.type}</p>
                                        <p className="text-sm text-stone-600 mb-1">Status: {prop.status}</p>
                                        <p className="text-sm text-stone-600 mb-1">Carpet Area: {prop.carpetArea} sq.ft.</p>
                                        <Link
                                            to={`/listings/${prop.id}`}
                                            className="relative inline-block mt-4 font-medium text-stone-700 text-sm after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-full after:bg-stone-700 hover:font-bold"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div
                        id="section4"
                        ref={(el) => (sectionRefs.current[3] = el)}
                        className="p-6 border-t border-gray-200 text-center relative z-10 transition-opacity duration-600"
                        style={{ opacity: 1, transform: 'translateY(0)' }}
                    >
                        <Link
                            to="/developer"
                            className="relative inline-block px-5 py-2 rounded-lg font-medium text-white bg-stone-700 z-10 overflow-hidden
    before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600 
    before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white"
                        >
                            Back to Developers
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyDetails;