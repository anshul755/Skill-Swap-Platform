// File: src/components/DashboardNavbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import defaultAvatar from '../assets/default-avatar.png';

const DashboardNavbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Fetch the user's profile picture from localStorage or API
    useEffect(() => {
        const fetchProfilePhoto = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('https://skill-swap-platform-backend.onrender.com/api/profile', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setProfilePhoto(data.profilePhotoUrl || null);
                } else {
                    setProfilePhoto(null);
                }
            } catch (err) {
                console.error('Failed to fetch profile photo:', err);
                setProfilePhoto(null);
            }
        };

        fetchProfilePhoto();
    }, []);

    const handleToggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="bg-[#111111] border-b p-4 flex justify-between items-center">
            <h1 className="text-white text-2xl font-bold text-left flex-1">Skillify</h1>

            <div className="flex items-center space-x-6 relative">
                <Link to="/dashboard" className="text-orange-500 hover:text-white font-medium">Home</Link>
                <div className="relative" ref={dropdownRef}>
                    <img
                        src={profilePhoto || defaultAvatar}
                        alt="Profile"
                        className="h-10 w-10 rounded-full cursor-pointer border-2 border-orange-500"
                        onClick={handleToggleDropdown}
                    />
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-[#222] border border-orange-500 rounded shadow-lg z-50">
                            <Link
                                to="/profile"
                                className="block px-4 py-2 text-white hover:bg-orange-500 hover:text-black"
                                onClick={() => setDropdownOpen(false)}
                            >
                                Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-white hover:bg-red-500 hover:text-black"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default DashboardNavbar;
