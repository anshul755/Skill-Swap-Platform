import UserProfile from '../models/UserProfile.js';

// Get all public profiles except self, and indicate if request sent by current user
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await UserProfile.find({
      profileVisibility: "public",
      user: { $ne: req.user._id }
    }).populate('user', 'email').lean();

    for (const p of profiles) {
      p.requestedByMe = p.requests?.some(uid => uid.toString() === req.user._id.toString());
    }
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profiles', details: err.message });
  }
};

// Get own profile
export const getProfile = async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ user: req.user._id });
    if (!userProfile) return res.status(404).json({ error: 'Profile not found' });
    res.json(userProfile);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Create or update own profile
export const upsertProfile = async (req, res) => {
  try {
    const { name, location, availability, profileVisibility } = req.body;
    if (!req.user || !req.user._id) return res.status(401).json({ error: "Unauthorized" });
    if (!name || name.trim() === '') return res.status(400).json({ error: "Name is required" });

    let skillsOffered = [];
    let skillsWanted = [];
    try {
      skillsOffered = JSON.parse(req.body.skillsOffered || '[]');
      skillsWanted = JSON.parse(req.body.skillsWanted || '[]');
    } catch {
      return res.status(400).json({ error: "Invalid skills format" });
    }
    const profilePhotoUrl = req.file?.path;

    let updatedProfile = await UserProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          name,
          location,
          availability,
          profileVisibility,
          skillsOffered,
          skillsWanted,
          ...(profilePhotoUrl && { profilePhotoUrl })
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    if (!updatedProfile.user) {
      updatedProfile.user = req.user._id;
      await updatedProfile.save();
    }

    res.json(updatedProfile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save profile', details: err.message });
  }
};

// Send a connection request
export const requestConnection = async (req, res) => {
  const targetProfileId = req.params.profileId;
  try {
    const targetProfile = await UserProfile.findById(targetProfileId);
    if (!targetProfile) return res.status(404).json({ error: "User not found" });
    if (targetProfile.user.equals(req.user._id)) return res.status(400).json({ error: "Cannot request yourself" });
    if (targetProfile.requests.includes(req.user._id)) return res.status(400).json({ error: "Already requested" });

    if (!targetProfile.$inc(req.user._id)) {
      targetProfile.requests.push(req.user._id);
      await targetProfile.save();
      res.json({ success: true, message: "Request sent" });
    } else {
      res.json({ success: false, message: "Request Already sent" });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error sending request', details: err.message });
  }
};

// Get all connection requests (invitations)
export const getRequests = async (req, res) => {
  try {
    const userProfile = await UserProfile.findOne({ user: req.user._id })
      .populate('requests', 'name profilePhotoUrl skillsOffered skillsWanted location user');
    if (!userProfile) return res.status(404).json({ error: "Profile not found" });
    res.json(userProfile.requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get requests', details: err.message });
  }
};

// Approve or reject a request
export const handleRequest = async (req, res) => {
  const { requesterId } = req.params;
  const { action } = req.body; // "approve" or "reject"
  try {
    const userProfile = await UserProfile.findOne({ user: req.user._id });
    if (!userProfile) return res.status(404).json({ error: "Profile not found" });

    if (!userProfile.requests.includes(requesterId)) return res.status(404).json({ error: "Request not found" });

    if (action === 'approve') {
      userProfile.connections.push(requesterId);
      // Also add you to the other user's connections
      const requesterProfile = await UserProfile.findOne({ user: requesterId });
      if (requesterProfile && !requesterProfile.connections.includes(req.user._id)) {
        requesterProfile.connections.push(req.user._id);
        await requesterProfile.save();
      }
    }
    // Remove the request
    userProfile.requests = userProfile.requests.filter(id => id.toString() !== requesterId);
    await userProfile.save();
    res.json({ success: true, message: `Request ${action}d` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to handle request', details: err.message });
  }
};