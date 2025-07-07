import React from 'react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property }) => {

  return (
    <div key={property.id} className="rounded max-w-6xl max-h-8xl shadow hover:shadow-lg transition text-white">
      <div className="relative group h-100 w-full overflow-hidden rounded">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded"/>
        <div className="absolute inset-0 bg-transparent backdrop-blur bg-opacity-40 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 text-left">
            <h3 className="text-lg font-semibold">{property.name}</h3>
            <p className="text-sm">{property.location}</p>
            <p className="text-sm">{property.bhk} BHK • ₹{property.price.toLocaleString()}</p>
            <p className="text-sm">{property.type} • {property.status}</p>
            <Link
              to={`/detail/${property.id}`}
              className="inline-block text-rose-100 hover:underline mt-1">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;