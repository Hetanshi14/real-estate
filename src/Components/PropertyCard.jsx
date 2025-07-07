import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {
 

  return (
    <div className="bg-stone-700 p-2 rounded shadow hover:shadow-lg transition">
      <img
        src={property.image}
        alt={property.name}
        className="w-full h-150 object-cover rounded mb-4"/>
      <h3 className="text-lg font-semibold text-center text-white">{property.name}</h3>
      <p className="text-sm text-center text-white mb-1">{property.location}</p>
      <p className="text-sm text-center text-white">{property.bhk} BHK • ₹{property.price.toLocaleString()}</p>
      <p className="text-sm text-center text-white mb-2">{property.type} • {property.status}</p>
      <Link
        to={`/detail/${property.id}`}
        className="mt-4 flex justify-center text-rose-100 hover:underline">
        View Details
      </Link>
    </div>
  );
};

export default PropertyCard;