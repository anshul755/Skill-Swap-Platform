import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        'https://skill-swap-platform-backend.onrender.com/api/auth/login',
        { email, password }
      );

      if (data?.token) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard', { replace: true });
      } else {
        alert('Login failed: No token returned');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4">
      <div className="bg-[#1E1E1E] border border-orange-600 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-orange-500 mb-6 text-center">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-orange-400 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-black text-orange-100 placeholder-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-[#222222] transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-orange-400 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg bg-black text-orange-100 placeholder-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-[#222222] transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-semibold transition shadow-md"
          >
            Log In
          </button>
        </form>

        <p className="mt-6 text-center text-orange-400">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-orange-500 hover:text-white font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
