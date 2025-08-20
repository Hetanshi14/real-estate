// src/Components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaPaperPlane } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      let email = formData.identifier.toLowerCase();

      // Resolve username to email
      if (!formData.identifier.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', formData.identifier)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          console.error('Error fetching user data:', userError);
          throw new Error('Error fetching user data. Please try again.');
        }
        if (userData) {
          email = userData.email;
        } else {
          throw new Error('Username not found.');
        }
      }

      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: formData.password,
      });

      if (error) {
        console.error('Login error:', error.message);
        throw new Error(
          error.message.includes('confirm')
            ? 'Please confirm your email before logging in.'
            : error.message.includes('invalid')
            ? 'Invalid username/email or password. Please try again.'
            : `Login failed: ${error.message}`
        );
      }

      // Verify session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to retrieve session after login.');
      }
      if (!sessionData.session) {
        console.error('No session after login');
        throw new Error('Session not established after login. Please try again.');
      }

      console.log('User logged in:', data.user);
      setSuccess('Login successful! Redirecting to profile...');
      setTimeout(() => {
        navigate('/profile', { replace: true });
        console.log('Navigation triggered to /profile');
      }, 1000); // Brief delay to show success message
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const email = formData.identifier.includes('@') ? formData.identifier.toLowerCase() : null;
      if (!email) {
        throw new Error('Please enter an email to resend confirmation.');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        console.error('Resend confirmation error:', error);
        throw new Error(`Failed to resend confirmation: ${error.message}`);
      }

      setSuccess('Confirmation email resent! Please check your inbox.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_IN' && session) {
        console.log('Redirecting to /profile from auth state change');
        navigate('/profile', { replace: true });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url('/bglogin.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      <div className="absolute inset-0 bg-black/40" style={{ zIndex: 0 }}></div>
      <motion.section
        className="max-w-md w-full bg-white bg-opacity-90 shadow-md rounded-lg p-8 relative m-5 z-10"
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
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 text-center">
            {success}
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
        {error?.includes('confirm') && (
          <div className="mt-4 text-center">
            <button
              onClick={handleResendConfirmation}
              disabled={loading}
              className={`relative w-full py-3 px-6 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
                before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
                before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaPaperPlane className="inline mr-2" />
              {loading ? 'Resending...' : 'Resend Confirmation Email'}
            </button>
          </div>
        )}
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