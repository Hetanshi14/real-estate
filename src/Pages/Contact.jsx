import React, { useState, useEffect, useRef } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [visibleSections, setVisibleSections] = useState([]);
    const bannerRef = useRef(null);
    const contactRef = useRef(null);
    const formRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !visibleSections.includes(entry.target.id)) {
                        setVisibleSections(prev => [...prev, entry.target.id]);
                    }
                });
            },
            { threshold: 0.2 }
        );

        if (bannerRef.current) observer.observe(bannerRef.current);
        if (contactRef.current) observer.observe(contactRef.current);
        if (formRef.current) observer.observe(formRef.current);

        return () => {
            if (bannerRef.current) observer.unobserve(bannerRef.current);
            if (contactRef.current) observer.unobserve(contactRef.current);
            if (formRef.current) observer.unobserve(formRef.current);
        };
    }, [visibleSections]);

    const isVisible = (id) => visibleSections.includes(id);

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
                className={`relative h-[80vh] bg-cover bg-center flex p-20 items-center transition-all duration-1000 transform ${
                    isVisible('contactBanner') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ backgroundImage: `url(https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Bg%20img/bgcontact.jpg)` }}
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
                    className={`transition-all duration-1000 transform ${
                        isVisible('contactInfo') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
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
                                <p className="text-stone-600">info@realestate.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <FaMapMarkerAlt className="text-stone-700 text-xl" />
                            <div>
                                <p className="font-semibold text-stone-700">Office</p>
                                <p className="text-stone-600">123 Builder Avenue</p>
                                <p className="text-stone-600">New York, NY 10001</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form
                    id="contactForm"
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className={`bg-white shadow-md p-6 rounded space-y-5 w-full transition-all duration-1000 transform ${
                        isVisible('contactForm') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
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
                                className="w-full border border-stone-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-stone-500"
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
                                className="w-full border border-stone-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-stone-500"
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
                            className="w-full border border-stone-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-stone-500"
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
                            className="w-full border border-stone-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-stone-500"
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
