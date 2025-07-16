import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaBuilding } from 'react-icons/fa';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    return hasUpperCase && hasSymbol && hasLowerCase && password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Check for duplicate username
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', formData.username);

      if (checkError) throw new Error('Error checking username availability.');
      if (existingUsers.length > 0) throw new Error('Username already taken. Please choose a different one.');

      // Validate password
      if (!validatePassword(formData.password)) {
        throw new Error('Password must start with an uppercase letter, include at least one symbol (!@#$%^&*(),.?":{}|<>), and contain at least one lowercase letter.');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { username: formData.username, role: formData.role },
        },
      });

      if (authError) {
        console.error('Auth error:', authError.message);
        throw new Error(authError.message);
      }

      const { error: insertError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          username: formData.username,
          email: formData.email,
          role: formData.role,
        },
      ]);

      if (insertError) {
        console.error('Insert error:', insertError.message);
        throw new Error(`Failed to create user profile: ${insertError.message}`);
      }

      // Redirect to login with success message
      setSuccess(true);
      navigate('/login', { state: { message: 'Signup successful! Confirm your email.' } });
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(
        err.message.includes('email')
          ? 'This email is already registered. Please use a different email or log in.'
          : err.message.includes('weak')
          ? 'Password is too weak. Use at least 6 characters.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url('https://znyzyswzocugaxnuvupe.supabase.co/storage/v1/object/public/images/Bg%20img/bgsignup.jpg')`,
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
        className="max-w-md w-full bg-white shadow-md rounded-lg p-8 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-stone-700 mb-6 text-center">Sign Up</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        {success && !error && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 text-center">
            Redirecting to login...
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
              <FaUser className="mr-2" /> Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
              <FaEnvelope className="mr-2" /> Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
              <FaLock className="mr-2" /> Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
              placeholder="Enter your password"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
              <FaBuilding className="mr-2" /> Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent text-sm"
            >
              <option value="customer">Customer</option>
              <option value="developer">Developer</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`relative w-full py-3 px-6 rounded-lg font-semibold text-white bg-stone-700 z-10 overflow-hidden
              before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:bg-stone-600
              before:z-[-1] before:transition-all before:duration-300 hover:before:w-full hover:text-white
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-600">
          Already have an account?{' '}
          <Link to="/login" className="text-stone-700 hover:underline">
            Log In
          </Link>
        </p>
      </motion.section>
    </div>
  );
};

export default SignUp;
