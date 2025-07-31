import React, { useState, useRef } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Logo URL
const LOGO_URL = "https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/logo/zivaaslogo01.jpg";

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [visibleSections, setVisibleSections] = useState(['contactBanner', 'contactInfo', 'contactForm']); // Initialize with all sections visible

    const bannerRef = useRef(null);
    const contactRef = useRef(null);
    const formRef = useRef(null);

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
                id="contactBanner"
                ref={bannerRef}
                className="relative h-[77vh] bg-cover bg-center flex p-20 items-center transition-all duration-1000"
                style={{ backgroundImage: `url(https://i.pinimg.com/1200x/6e/b4/1c/6eb41c402cdd5c7d9f51ab8e68c6d284.jpg)` }}
                onError={(e) => {
                    console.error('Contact banner background image load failed');
                    e.target.style.backgroundImage = 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80)';
                }}
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
                <div
                    id="contactInfo"
                    ref={contactRef}
                    className="transition-all shadow-md p-6 bg-stone-100 rounded duration-1000"
                >
                    <h2 className="text-3xl font-bold text-stone-700 mb-6">Contact Information</h2>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <FaPhoneAlt className="text-stone-700 text-xl" />
                            <div>
                                <p className="font-semibold text-stone-700">Phone</p>
                                <p className="text-stone-600">+91 98765 43210</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <FaEnvelope className="text-stone-700 text-xl" />
                            <div>
                                <p className="font-semibold text-stone-700">Email</p>
                                <p className="text-stone-600">contact@zivaas.in</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <FaMapMarkerAlt className="text-stone-700 text-xl" />
                            <div>
                                <p className="font-semibold text-stone-700">Office</p>
                                <p className="text-stone-600">Ahmedabad, Gujarat, India</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form
                    id="contactForm"
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="shadow-md p-6 bg-stone-100 rounded space-y-5 w-full transition-all duration-1000"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-stone-700 font-medium mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full border border-stone-300 px-4 py-2 rounded focus:outline-none focus:ring-none focus:ring-stone-500"
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
                                className="w-full border border-stone-300 px-4 py-2 rounded focus:outline-none focus:ring-none focus:ring-stone-500"
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
                            className="w-full border border-stone-300 px-4 py-2 rounded focus:outline-none focus:ring-none focus:ring-stone-500"
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
                            className="w-full border border-stone-300 px-4 py-2 rounded focus:outline-none focus:ring-none focus:ring-stone-500"
                            placeholder="Tell us about your project or inquiry..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="relative px-6 py-2 rounded font-medium text-white bg-stone-700 z-10 overflow-hidden
             before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600 
             before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white flex items-center gap-2"
                    >
                        Send Inquiry <FaPaperPlane />
                    </button>
                </form>
            </section>

            <div className="bg-stone-50 text-center py-12 text-stone-500 text-sm">
                Interactive map would be displayed here. <br />
                Consider embedding Google Maps for a live implementation.
            </div>
        </div>
    );
};

export default ContactUs;