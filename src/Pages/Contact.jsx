import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import bgcontact from '../assets/bgcontact.jpg';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert('Thank you for reaching out!');
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
        });
    };

    return (
        <div className="bg-white">
            <section
                className="relative h-[80vh] bg-cover bg-center flex p-20 items-center"
                style={{ backgroundImage: `url(${bgcontact})` }}
            >
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 text-white px-4">
                    <h1 className="text-5xl font-semibold mb-3">Contact Us</h1>
                    <p className="text-2xl max-w-xl mx-auto">
                        Got a project idea? We’re here to make it happen — reach out today.
                    </p>
                </div>
            </section>

            <section className="py-16 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
                <div>
                    <h2 className="text-3xl font-bold text-stone-700 mb-6">Contact Information</h2>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <FaPhoneAlt className="text-yellow-600 text-xl" />
                            <div>
                                <p className="font-semibold text-stone-700">Phone</p>
                                <p className="text-stone-600">+91 98765 43210</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <FaEnvelope className="text-yellow-600 text-xl" />
                            <div>
                                <p className="font-semibold text-stone-700">Email</p>
                                <p className="text-stone-600">info@realestate.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <FaMapMarkerAlt className="text-yellow-600 text-xl" />
                            <div>
                                <p className="font-semibold text-stone-700">Office</p>
                                <p className="text-stone-600">123 Builder Avenue</p>
                                <p className="text-stone-600">New York, NY 10001</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow-md p-6 rounded space-y-5 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-stone-700 font-medium mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full border border-stone-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
                            />
                        </div>

                        <div>
                            <label className="block text-stone-700 font-medium mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full border border-stone-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-stone-700 font-medium mb-1">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="w-full border border-stone-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
                        />
                    </div>

                    <div>
                        <label className="block text-stone-700 font-medium mb-1">Your Message</label>
                        <textarea
                            name="message"
                            rows="5"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            className="w-full border border-stone-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
                            placeholder="Tell us about your project or inquiry..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-yellow-600 text-white font-semibold px-6 py-2 rounded hover:bg-yellow-500 flex items-center gap-2"
                    >
                        Send Inquiry <FaPaperPlane />
                    </button>
                </form>
            </section>

            <div className="bg-yellow-50 text-center py-12 text-stone-500 text-sm">
                Interactive map would be displayed here. <br />
                Consider embedding Google Maps for a live implementation.
            </div>
        </div>
    );
};

export default ContactUs;
