import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/User.js';
import authMiddleware from './middlewares/authMiddleware.js';
import UserProfileRoutes from './routes/UserProfile.js';
import ConnectionRoutes from "./routes/Connection.js";
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.json({ message: `Welcome back, ${req.user.email}!` });
});

app.use('/api/profile', UserProfileRoutes);
app.use("/api/connection", ConnectionRoutes);

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected ✅');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT} 🚀`)
    );
  })
  .catch(err => console.error('DB connection error:', err));