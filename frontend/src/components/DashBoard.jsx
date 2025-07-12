import React, { useEffect, useState } from "react";
import defaultAvatar from "../assets/default-avatar.png";

// Utility to get token from localStorage
const getToken = () => localStorage.getItem("token");

// Utility to decode JWT and get user ID
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

const Dashboard = () => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState({});
  const [message, setMessage] = useState("");
  const pageSize = 3;

  // For "Sent" logic
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const payload = parseJwt(token);
      setCurrentUserId(payload?.id || payload?._id || null);
    }
    fetchProfiles();
    // eslint-disable-next-line
  }, []);

  // Filtering and pagination logic
  useEffect(() => {
    let filtered = profiles;
    if (availability)
      filtered = filtered.filter((p) =>
        p.availability?.toLowerCase().includes(availability.toLowerCase())
      );
    if (search)
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.skillsOffered?.some((s) =>
            s.toLowerCase().includes(search.toLowerCase())
          ) ||
          p.skillsWanted?.some((s) =>
            s.toLowerCase().includes(search.toLowerCase())
          )
      );
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
    setFilteredProfiles(filtered.slice((page - 1) * pageSize, page * pageSize));
  }, [profiles, availability, search, page]);

  // Fetch profiles
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("https://skill-swap-platform-backend.onrender.com/api/profile/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profiles");
      const data = await res.json();
      setProfiles(data);
    } catch (err) {
      setMessage("Failed to load profiles.");
      console.error("Error fetching profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  // Request connection handler
  const handleRequest = async (profileId) => {
    setRequesting((r) => ({ ...r, [profileId]: true }));
    setMessage("");
    try {
      const token = getToken();
      const res = await fetch(
        `https://skill-swap-platform-backend.onrender.com/api/profile/request/${profileId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Request failed");
      setMessage("Connection request sent!");
      // Update the requestedByMe flag without refetching all
      setProfiles((prev) =>
        prev.map((p) =>
          p._id === profileId ? { ...p, requestedByMe: true } : p
        )
      );
    } catch (err) {
      setMessage("Failed to send request.");
      console.error("Request error:", err);
    } finally {
      setRequesting((r) => ({ ...r, [profileId]: false }));
    }
  };

  // Pagination controls
  const goToPage = (p) => setPage(p);

  return (
    <>
      <h1 className="text-white text-5xl font-bold text-center bg-[#111111]">Welcome to Dashboard.</h1>
      <div className="min-h-screen bg-[#111] text-white flex flex-col items-center py-8">
        <div className="w-full max-w-5xl bg-[#1a1a1a] rounded-xl p-8 border border-orange-500 shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Skill Swap Platform</h1>
            <a href="/connections">
              <button className="bg-[#145e6e] text-white font-semibold px-6 py-2 rounded-full border-2 border-white hover:bg-[#0d3d48]">
                Connections
              </button>
            </a>
          </div>
          <div className="flex flex-wrap gap-4 items-center mb-8">
            <div className="relative">
              <select
                className="bg-[#222] text-white border border-gray-400 rounded px-4 py-2"
                value={availability}
                onChange={(e) => {
                  setAvailability(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Availability</option>
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
                <option value="Evenings">Evenings</option>
                <option value="Flexible">Flexible</option>
                <option value="By Appointment">By Appointment</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Search by name or skill..."
              className="bg-[#222] text-white border border-gray-400 rounded px-4 py-2 flex-1 min-w-[200px]"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <button
              className="bg-[#145e6e] text-white font-semibold px-6 py-2 rounded-full border-2 border-white hover:bg-[#0d3d48]"
              onClick={() => setPage(1)}
            >
              search
            </button>
          </div>
          {message && (
            <div className="mb-4 text-center text-orange-300">{message}</div>
          )}
          {loading ? (
            <div className="text-center py-12">Loading profiles...</div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-12">No profiles found.</div>
          ) : (
            <div>
              {filteredProfiles.map((profile) => (
                <div
                  key={profile._id}
                  className="flex items-center justify-between bg-[#181818] border border-gray-700 rounded-2xl px-6 py-6 mb-8"
                >
                  <div className="flex items-center gap-6">
                    <img
                      src={profile.profilePhotoUrl || defaultAvatar}
                      alt={profile.name}
                      className="h-20 w-20 rounded-full border-2 border-white object-cover"
                    />
                    <div>
                      <div className="text-2xl font-bold mb-1">{profile.name}</div>
                      <div className="flex flex-wrap items-center mb-1">
                        <span className="text-green-400 mr-2 text-sm font-semibold">
                          Skills Offered:
                        </span>
                        {profile.skillsOffered &&
                          profile.skillsOffered.map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-[#222] border border-green-400 text-green-300 mx-1 px-3 py-1 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                      <div className="flex flex-wrap items-center mb-1">
                        <span className="text-blue-300 mr-2 text-sm font-semibold">
                          Skill wanted:
                        </span>
                        {profile.skillsWanted &&
                          profile.skillsWanted.map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-[#222] border border-blue-400 text-blue-300 mx-1 px-3 py-1 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    {profile.requestedByMe ? (
                      <button className="bg-gray-600 cursor-not-allowed px-6 py-2 rounded-lg border-2 border-white text-white font-bold" disabled>
                        Sent
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRequest(profile._id)}
                        disabled={requesting[profile._id]}
                        className={`bg-[#145e6e] text-white font-bold px-6 py-2 rounded-lg border-2 border-white hover:bg-[#0d3d48] transition ${requesting[profile._id]
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                          }`}
                      >
                        Request
                      </button>
                    )}
                    <div className="text-white text-sm">
                      rating{" "}
                      <span className="font-semibold">
                        {(profile.rating || (Math.random() * 2 + 3).toFixed(1)) +
                          "/5"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {/* Pagination */}
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  className="text-lg px-2"
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 rounded-full border ${page === i + 1
                      ? "bg-orange-500 border-orange-500 text-black"
                      : "border-gray-600 text-white"
                      }`}
                    onClick={() => goToPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="text-lg px-2"
                  onClick={() => goToPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;