import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { FaUser, FaLock } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let email = formData.identifier;

      // Check if the identifier is a username
      if (!formData.identifier.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', formData.identifier)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          throw new Error('Error fetching user data.');
        }
        if (userData) {
          email = userData.email;
        } else {
          throw new Error('Username not found.');
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (error) {
        console.error('Login error:', error.message);
        throw new Error(error.message);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('User logged in:', data.user);
        navigate('/profile');
      } else {
        throw new Error('Session not established after login.');
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(
        err.message.includes('invalid')
          ? 'Invalid username/email or password. Please try again.'
          : err.message.includes('confirmation')
          ? 'Please confirm your email before logging in.'
          : 'Failed to log in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url('/public/bglogin.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      <div
        className="absolute inset-0 bg-black/40"
        style={{ zIndex: 0 }}
      ></div>
      <motion.section
        className="max-w-md w-full bg-white shadow-md rounded-lg p-8 relative m-5 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-stone-700 mb-6 text-center">Log In</h2>
        {location.state?.message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 text-center">
            {location.state.message}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
              <FaUser className="mr-2" /> Username or Email *
            </label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
              placeholder="Enter username or email"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
              <FaLock className="mr-2" /> Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`relative w-full py-3 px-6 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
              before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
              before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-600">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-stone-700 hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.section>
    </div>
  );
};

export default Login;
