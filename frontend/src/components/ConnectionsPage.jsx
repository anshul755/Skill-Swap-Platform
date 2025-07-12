import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import defaultAvatar from "../assets/default-avatar.png";

const getToken = () => localStorage.getItem("token");

const ConnectionsPage = () => {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileAndRequests();
    // eslint-disable-next-line
  }, []);

  const fetchProfileAndRequests = async () => {
    setLoading(true);
    try {
      const token = getToken();
      // Fetch own profile
      const res = await fetch("https://skill-swap-platform-backend.onrender.com/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);

      // Fetch incoming requests
      const reqRes = await fetch("https://skill-swap-platform-backend.onrender.com/api/profile/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (reqRes.ok) {
        const requestsData = await reqRes.json();
        setRequests(requestsData);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requesterId, action) => {
    setActioning((a) => ({ ...a, [requesterId]: true }));
    try {
      const token = getToken();
      const res = await fetch(
        `https://skill-swap-platform-backend.onrender.com/api/profile/handle-request/${requesterId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }), // "approve" or "reject"
        }
      );
      if (res.ok) {
        setRequests((reqs) =>
          reqs.filter((r) => r._id !== requesterId && r.user !== requesterId)
        );
        // Refetch profile to update connections count
        fetchProfileAndRequests();
      }
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setActioning((a) => ({ ...a, [requesterId]: false }));
    }
  };

  if (loading)
    return <div className="text-center text-white mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col items-center py-8">
      <div className="w-full max-w-3xl bg-[#1a1a1a] rounded-xl p-8 border border-orange-500 shadow-lg">
        {/* Own Profile Summary */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <img
              src={profile?.profilePhotoUrl || defaultAvatar}
              className="h-16 w-16 rounded-full border-2 border-white object-cover"
              alt={profile?.name}
            />
            <div>
              <div className="text-xl font-bold">{profile?.name}</div>
              <div className="text-sm text-gray-300">{profile?.location}</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile?.skillsOffered?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-[#222] border border-green-400 text-green-300 px-2 py-1 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div>
              <span className="font-semibold text-orange-400">
                Connections:{" "}
              </span>
              {profile?.connections?.length || 0}
            </div>
            <button
              className="bg-orange-600 hover:bg-orange-700 text-white rounded px-4 py-2"
              onClick={() => navigate("/profile")}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Incoming Requests */}
        <h2 className="text-lg font-semibold mb-4 text-orange-400">
          Incoming Connection Requests
        </h2>
        {(!requests || requests.length === 0) && (
          <div className="text-gray-400 mb-6">
            No incoming requests at the moment.
          </div>
        )}
        {requests.map((r) => (
          <div
            key={r._id || r.user}
            className="flex items-center justify-between bg-[#181818] border border-gray-600 rounded-xl px-6 py-4 mb-5"
          >
            <div className="flex items-center gap-4">
              <img
                src={r.profilePhotoUrl || defaultAvatar}
                alt={r.name}
                className="h-12 w-12 rounded-full border border-white object-cover"
              />
              <div>
                <div className="font-semibold">{r.name}</div>
                <div className="flex flex-wrap gap-1">
                  {r.skillsOffered?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-[#222] border border-green-400 text-green-300 px-2 py-0.5 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-400">{r.location}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(r.user || r._id, "approve")}
                disabled={actioning[r.user || r._id]}
                className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(r.user || r._id, "reject")}
                disabled={actioning[r.user || r._id]}
                className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionsPage;