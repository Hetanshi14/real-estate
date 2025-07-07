import React, { useState, useEffect } from 'react';
import { allProperties } from '../data/properties';

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
    <div className="bg-rose-50 min-h-screen px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-700 text-center mb-8">Book a Site Visit</h1>

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
              className="w-full border-1 border-white text-white px-3 py-2 rounded"/>
          </div>

          <div>
            <label className="block mb-1 text-white">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border-1 border-white text-white px-3 py-2 rounded"/>
          </div>

          <div>
            <label className="block mb-1 text-white">Select Property</label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              required
              className="w-full border-1 border-white text-white px-3 py-2 rounded">
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
              className="w-full border-1 border-white text-white px-3 py-2 rounded"/>
          </div>

          <div>
            <label className="block mb-1 text-white">Preferred Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full border-1 border-white text-white px-3 py-2 rounded"/>
          </div>

          <button
            type="submit"
            className="text-stone-700 bg-white px-4 py-2 rounded hover:text-white hover:bg-stone-700 border-1 border-white">
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
  );
};

export default Booking;
