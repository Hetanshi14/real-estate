import React, { useState } from 'react';

const PropertyForm = ({ property, onClose }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Booking submitted:', { ...form, propertyId: property.id });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-green-600 font-semibold text-center">
        ✅ Your interest has been registered successfully!
        <div>
          <button onClick={onClose} className="mt-4 text-rose-100 hover:underline">Close</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl grid gap-4">
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
        placeholder="Your Name"
        className="p-2 border-white border-1 text-white rounded"/>
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        required
        placeholder="Email"
        className="p-2 border-white border-1 text-white rounded"/>
      <input
        type="tel"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        required
        placeholder="Phone Number"
        className="p-2 border-white border-1 text-white rounded"/>
      <div  className="flex justify-center">
        <button type="submit" className="relative inline-block w-40 px-4 py-2 rounded text-sm text-stone-700 bg-white border z-10 overflow-hidden 
              before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-700 
              before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white">
          Submit Interest
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;
