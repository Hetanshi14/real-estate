import React, { useState, useEffect } from 'react';
import { allProperties } from '../data/properties';
import bgbooking from '../assets/bgbooking.jpg'; // <-- your image

const Booking = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    propertyId: '',
    date: '',
    time: ''
  });

  const [bookings, setBookings] = useState([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem('zivaas_bookings')) || [];
    setBookings(savedBookings);
  }, []);

  useEffect(() => {
    localStorage.setItem('zivaas_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newBooking = {
      ...formData,
      id: Date.now()
    };

    setBookings(prev => [...prev, newBooking]);

    setSuccess(true);
    setFormData({
      name: '',
      phone: '',
      propertyId: '',
      date: '',
      time: ''
    });

    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <>
      <section
        className="relative h-[80vh] bg-cover text-white bg-center flex p-20 items-center"
        style={{ backgroundImage: `url(${bgbooking})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-semibold mb-3">Book Your Visit</h1>
          <p className="text-2xl md:text-xl text-gray-200 max-w-2xl mx-auto">
            Schedule a personalized site visit with our team and explore the spaces that could be your next dream investment.
          </p>
        </div>
      </section>

      <div className="bg-rose-50 min-h-screen px-6 py-10">

        <div className="max-w-xl mx-auto bg-stone-700 shadow p-6 rounded">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-white">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border-1 border-white text-white px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block mb-1 text-white">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full border-1 border-white text-white px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block mb-1 text-white">Select Property</label>
              <select
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                required
                className="w-full border-1 border-white text-white bg-stone-700 px-3 py-2 rounded">
                <option value="">-- Select --</option>
                {allProperties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-white">Preferred Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full border-1 border-white text-white px-3 py-2 rounded" />
            </div>

            <div>
              <label className="block mb-1 text-white">Preferred Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full border-1 border-white text-white px-3 py-2 rounded" />
            </div>

            <button
              type="submit"
              className="relative inline-block w-20 px-4 py-2 rounded text-sm text-stone-700 bg-white border z-10 overflow-hidden 
              before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-700 
              before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white">
              Submit
            </button>

            {success && (
              <p className="text-green-600 font-medium mt-4">
                ✅ Your booking has been submitted successfully!
              </p>
            )}

          </form>
        </div>
      </div>
    </>
  );
};

export default Booking;
