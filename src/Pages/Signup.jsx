import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../context/AuthContext'; // Corrected import
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaBuilding } from 'react-icons/fa';

const SignUp = () => {
  const { user } = useContext(AuthContext); // Access user from AuthContext
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  // Redirect authenticated users to home
  if (user) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length > 0) strength = 1;
    if (password.length >= 8) strength = 2;
    if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password)) strength = 3;
    if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
      /\d/.test(password)
    ) strength = 4;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (!formData.password) {
      setError('Password cannot be empty.');
      setLoading(false);
      return;
    }

    if (passwordStrength < 4) {
      setError(
        'Password is too weak. It must be at least 8 characters, include uppercase and lowercase letters, a number, and a special character.'
      );
      setLoading(false);
      return;
    }

    try {
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', formData.username);

      if (checkError) {
        console.error('Error checking username:', checkError.message);
        throw new Error('Error checking username availability.');
      }
      if (existingUsers.length > 0) {
        throw new Error('Username already taken. Please choose a different one.');
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
          role: formData.role === 'admin' ? 'customer' : formData.role,
        },
      ]);

      if (insertError) {
        console.error('Insert error:', insertError.message);
        throw new Error(`Failed to create user profile: ${insertError.message}`);
      }

      console.log('User created:', authData.user.id, formData.username);
      setSuccess(true);
      setTimeout(
        () =>
          navigate('/login', {
            state: { message: 'Signup successful! Please log in.' },
          }),
        2000
      );
    } catch (err) {
      setError(
        err.message.includes('email')
          ? 'This email is already registered. Please use a different email or log in.'
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
        backgroundImage: "url('/bgsignup.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      <div className="absolute inset-0 bg-black/40" style={{ zIndex: 0 }}></div>
      <motion.section
        className="max-w-md w-full bg-white shadow-md rounded-lg p-8 relative m-5 z-10"
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
            Signup successful! Redirecting to login in 2 seconds...
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
              <FaUser className="mr-2" /> Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
              <FaEnvelope className="mr-2" /> Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
              placeholder="Enter your email"
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
            <div className="mt-2">
              <p className="text-sm text-stone-600">
                Password Strength: {passwordStrength}/4
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    passwordStrength === 1
                      ? 'bg-red-500'
                      : passwordStrength === 2
                      ? 'bg-yellow-500'
                      : passwordStrength === 3
                      ? 'bg-blue-500'
                      : passwordStrength === 4
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-2 flex items-center">
              <FaBuilding className="mr-2" /> Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-none focus:ring-stone-500 focus:border-transparent text-sm"
            >
              <option value="">Select</option>
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