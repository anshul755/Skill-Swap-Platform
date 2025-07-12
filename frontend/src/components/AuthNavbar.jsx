// File: src/components/AuthNavbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router';

const AuthNavbar = () => {
    const location = useLocation();
    const isLogin = location.pathname === '/login';
    const isSignup = location.pathname === '/signup';

    return (
        <nav className="bg-[#111111] border-b p-4 flex justify-between items-center">
            <h1 className="text-white text-xl font-bold">Skill Swap</h1>
            <div className="space-x-6">
                {!isLogin && (
                    <Link to="/login" className="text-orange-500 hover:text-white font-medium">Login</Link>
                )}
                {!isSignup && (
                    <Link to="/signup" className="text-orange-500 hover:text-white font-medium">Sign Up</Link>
                )}
            </div>
        </nav>
    );
};

export default AuthNavbar;
