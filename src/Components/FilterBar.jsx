import React from 'react';

const FilterBar = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-4 rounded flex flex-wrap md:gap-20 gap-2 mx-auto justify-center">
      <input
        type="text"
        name="location"
        value={filters.location}
        onChange={handleChange}
        placeholder="Location"
        className="border-1 bg-stone-200 border-stone-300 p-2 rounded  min-w-[150px]"
      />

      <select name="price" value={filters.price} onChange={handleChange} className="border-1 bg-stone-200 text-stone-700 border-stone-300 p-2 rounded min-w-[150px]">
        <option value="">Price</option>
        <option value="0-3000000">0-₹30L</option>
        <option value="3000000-5000000">₹30L-₹50L</option>
        <option value="5000000-7000000">₹50L-₹70L</option>
        <option value="7000000-10000000">₹70L-₹1cr</option>
        <option value="10000000+">₹1cr+</option>
      </select>

      <select name="bhk" value={filters.bhk} onChange={handleChange} className="border-1 bg-stone-200 text-stone-700 border-stone-300 p-2 rounded min-w-[150px]">
        <option value="">BHK</option>
        <option value="1">1 BHK</option>
        <option value="2">2 BHK</option>
        <option value="3">3 BHK</option>
        <option value="4">4+ BHK</option>
      </select>

      <select name="type" value={filters.type} onChange={handleChange} className="border-1 bg-stone-200 text-stone-700 border-stone-300 p-2 rounded min-w-[150px]">
        <option value="">Type</option>
        <option value="Flat">Flat</option>
        <option value="Villa">Villa</option>
        <option value="Plot">Plot</option>
      </select>

      <select name="status" value={filters.status} onChange={handleChange} className="border-1 bg-stone-200 text-stone-700 border-stone-300 p-2 rounded min-w-[150px]">
        <option value="">Status</option>
        <option value="Ready">Ready to Move</option>
        <option value="Under Construction">Under Construction</option>
      </select>

      <select name="sort" value={filters.sort} onChange={handleChange} className="border-1 bg-stone-200 text-stone-700 border-stone-300 p-2 rounded min-w-[150px]">
        <option value="">Sort</option>
        <option value="priceLowHigh">Price: Low to High</option>
        <option value="priceHighLow">Price: High to Low</option>
      </select>
    </div>
  );
};

export default FilterBar;
