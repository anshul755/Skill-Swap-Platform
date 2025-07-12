import React, { useState, useEffect } from 'react';
import defaultAvatar from '../assets/default-avatar.png';

const Profile = () => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        availability: '',
        profileVisibility: 'public',
    });
    const [skillsOffered, setSkillsOffered] = useState([]);
    const [skillsWanted, setSkillsWanted] = useState([]);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [profilePhotoFile, setProfilePhotoFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [skillInputOffered, setSkillInputOffered] = useState('');
    const [skillInputWanted, setSkillInputWanted] = useState('');
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Utility to get token from localStorage
    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            try {
                const token = getToken();
                const res = await fetch('https://skill-swap-platform-backend.onrender.com/api/profile', {
                    credentials: 'include',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (res.status === 404) {
                    setInitialData(null); // No profile exists
                } else if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Fetch failed: ${res.status} - ${text}`);
                } else if (res.headers.get('content-type')?.includes('application/json')) {
                    const data = await res.json();
                    const clean = {
                        name: data.name || '',
                        location: data.location || '',
                        availability: data.availability || '',
                        profileVisibility: data.profileVisibility || 'public',
                    };
                    setFormData(clean);
                    setSkillsOffered(data.skillsOffered || []);
                    setSkillsWanted(data.skillsWanted || []);
                    setProfilePhoto(data.profilePhotoUrl || null);
                    setInitialData({
                        formData: clean,
                        skillsOffered: data.skillsOffered || [],
                        skillsWanted: data.skillsWanted || [],
                        profilePhotoUrl: data.profilePhotoUrl || null,
                    });
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(f => ({ ...f, [name]: value }));
    };

    const addSkill = type => {
        if (type === 'offered' && skillInputOffered.trim()) {
            setSkillsOffered(s => [...s, skillInputOffered.trim()]);
            setSkillInputOffered('');
        } else if (type === 'wanted' && skillInputWanted.trim()) {
            setSkillsWanted(s => [...s, skillInputWanted.trim()]);
            setSkillInputWanted('');
        }
    };

    const removeSkill = (type, i) => {
        if (type === 'offered')
            setSkillsOffered(s => s.filter((_, idx) => idx !== i));
        else
            setSkillsWanted(s => s.filter((_, idx) => idx !== i));
    };

    const handlePhotoChange = e => {
        const file = e.target.files[0];
        if (!file) return;
        setProfilePhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setProfilePhoto(reader.result);
        reader.readAsDataURL(file);
    };

    const validateFields = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = 'Name is required';
        if (!formData.location.trim()) errs.location = 'Location is required';
        if (!formData.availability.trim()) errs.availability = 'Availability is required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validateFields()) return;
        const form = new FormData();
        form.append('name', formData.name);
        form.append('location', formData.location);
        form.append('availability', formData.availability);
        form.append('profileVisibility', formData.profileVisibility);
        form.append('skillsOffered', JSON.stringify(skillsOffered));
        form.append('skillsWanted', JSON.stringify(skillsWanted));
        if (profilePhotoFile) form.append('profilePhoto', profilePhotoFile);

        try {
            const token = getToken();
            const res = await fetch('http://localhost:5000/api/profile', {
                method: 'POST',
                body: form,
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Save failed: ${res.status} - ${text}`);
            }

            const data = await res.json();
            alert('Profile saved successfully!');
            // Refresh UI to match server
            setFormData({
                name: data.name || '',
                location: data.location || '',
                availability: data.availability || '',
                profileVisibility: data.profileVisibility || 'public',
            });
            setSkillsOffered(data.skillsOffered || []);
            setSkillsWanted(data.skillsWanted || []);
            setProfilePhoto(data.profilePhotoUrl || null);
            setInitialData({
                formData: {
                    name: data.name || '',
                    location: data.location || '',
                    availability: data.availability || '',
                    profileVisibility: data.profileVisibility || 'public',
                },
                skillsOffered: data.skillsOffered || [],
                skillsWanted: data.skillsWanted || [],
                profilePhotoUrl: data.profilePhotoUrl || null,
            });
            setProfilePhotoFile(null);
        } catch (err) {
            console.error('Error saving profile:', err);
            alert(`Failed to save profile: ${err.message}`);
        }
    };

    if (loading) {
        return <div className="text-white text-center mt-10">Loading profile...</div>;
    }

    return (
        <div className="min-h-screen bg-[#111] text-white flex items-center justify-center p-6">
            <div className="bg-[#1a1a1a] rounded-xl shadow-lg p-8 w-full max-w-3xl border border-orange-500">
                <div className="flex flex-col items-center mb-6 relative">
                    <div className="relative group transition duration-300 ease-in-out">
                        <img
                            src={profilePhoto || defaultAvatar}
                            alt="Profile"
                            className="h-32 w-32 rounded-full object-cover border-4 border-orange-500"
                        />
                        <label className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white opacity-0 group-hover:opacity-90 transition-opacity duration-300 cursor-pointer rounded-full">
                            Edit
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <h2 className="text-3xl text-center text-orange-500 font-bold mt-4">
                        User Profile
                    </h2>
                    {initialData === null && (
                        <p className="text-orange-400 mt-2">No profile found. Please create your profile!</p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-1">Name</label>
                        <input
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded bg-black text-white border border-orange-500"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block mb-1">Location</label>
                        <input
                            name="location"
                            type="text"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded bg-black text-white border border-orange-500"
                        />
                        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                    </div>
                    <div>
                        <label className="block mb-1">Skills Offered</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={skillInputOffered}
                                onChange={e => setSkillInputOffered(e.target.value)}
                                className="flex-1 p-2 rounded bg-black text-white border border-orange-500"
                            />
                            <button
                                onClick={() => addSkill('offered')}
                                className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded font-semibold"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skillsOffered.map((s, i) => (
                                <span key={i} className="bg-orange-500 text-black px-3 py-1 rounded-full">
                                    {s}{' '}
                                    <button onClick={() => removeSkill('offered', i)} className="ml-2">
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1">Skills Wanted</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={skillInputWanted}
                                onChange={e => setSkillInputWanted(e.target.value)}
                                className="flex-1 p-2 rounded bg-black text-white border border-orange-500"
                            />
                            <button
                                onClick={() => addSkill('wanted')}
                                className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded font-semibold"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skillsWanted.map((s, i) => (
                                <span key={i} className="bg-orange-500 text-black px-3 py-1 rounded-full">
                                    {s}{' '}
                                    <button onClick={() => removeSkill('wanted', i)} className="ml-2">
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1">Availability</label>
                        <select
                            name="availability"
                            value={formData.availability}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded bg-black text-white border border-orange-500"
                        >
                            <option value="">Select availability</option>
                            <option value="Weekdays">Weekdays</option>
                            <option value="Weekends">Weekends</option>
                            <option value="Evenings">Evenings</option>
                            <option value="Flexible">Flexible</option>
                            <option value="By Appointment">By Appointment</option>
                        </select>
                        {errors.availability && (
                            <p className="text-red-500 text-sm mt-1">{errors.availability}</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-1">Profile Visibility</label>
                        <select
                            name="profileVisibility"
                            value={formData.profileVisibility}
                            onChange={handleInputChange}
                            className="w-full p-2 rounded bg-black text-white border border-orange-500"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-8">
                    <button
                        onClick={handleSave}
                        className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded-lg font-semibold transition"
                    >
                        {initialData === null ? 'Create Profile' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;