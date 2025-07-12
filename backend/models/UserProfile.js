import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  user:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name:              { type: String, required: true },
  location:          { type: String },
  skillsOffered:     [{ type: String }],
  skillsWanted:      [{ type: String }],
  availability:      { type: String },
  profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
  profilePhotoUrl:   { type: String },
  requests:          [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // incoming connection requests
  connections:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]  // accepted connections
}, { timestamps: true });

export default mongoose.model('UserProfile', userProfileSchema);