import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const PropertyDetails = () => {
    const { developerName } = useParams();
    const [properties, setProperties] = useState([]);
    const [error, setError] = useState(null);
    const [developerImage, setDeveloperImage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeveloperProperties = async () => {
            setLoading(true);
            try {
                console.log('Fetching properties for developer:', developerName);
                const { data, error: fetchError } = await supabase
                    .from('properties')
                    .select(`
            id, name, location, price, carpet_area, configuration, property_type, total_floors,
            total_units, status, rera_number, amenities, developer_name, developer_tagline,
            developer_experience, developer_projects_completed, developer_happy_families,
            nearby_landmarks, developer_awards, developer_certifications, developer_description,
            images
          `)
                    .eq('developer_name', decodeURIComponent(developerName));

                if (fetchError) {
                    console.error('Supabase fetch error:', fetchError.message);
                    throw new Error(`Supabase error: ${fetchError.message}`);
                }

                console.log('Raw data from Supabase:', data);

                if (!data || data.length === 0) {
                    console.warn('No properties found for developer:', developerName);
                    setProperties([]);
                    setError('No properties found for this developer.');
                    return;
                }

                // Use the first property's images as a placeholder for developer image
                const firstProperty = data[0];
                const developerImg = Array.isArray(firstProperty.images) && firstProperty.images.length > 0 ? firstProperty.images[0] : null;
                developerImage(developerImg);

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
                    amenities: Array.isArray(p.amenities) ? p.amenities : [],
                    image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
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

                console.log('Mapped properties:', mappedProperties);
                setProperties(mappedProperties);
                setError(null);
            } catch (error) {
                console.error('Error in fetchDeveloperProperties:', error);
                setError(`Failed to load properties: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchDeveloperProperties();
    }, [developerName]);

    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-4xl mx-auto mb-8 text-center">
                    {error}
                </div>
            )}
            {properties.length > 0 && (
                <div>
                    {/* Hero Section - Developer Info */}
                    <div className="p-6 flex flex-col md:flex-row items-center text-stone-700">
                        {/* Developer Image - Left Top */}
                        <div className="w-full md:w-1/3 mb-4 md:mb-0">
                            <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                                {developerImage ? (
                                    <img
                                        src={developerImage}
                                        alt={`${properties[0].developer} logo`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error('Developer image load error for URL:', developerImage, e);
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-600">
                                        No developer image
                                    </div>
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
                    <div className="p-6">
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
                                            className="mt-4 inline-block bg-stone-700 text-white font-medium py-2 px-4 rounded-full hover:bg-stone-600 transition-all duration-200 text-sm"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="p-6 border-t border-gray-200 text-center">
                        <Link
                            to="/developer"
                            className="inline-block px-6 py-3 bg-stone-700 text-white font-medium rounded-lg hover:bg-stone-600 transition-colors"
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