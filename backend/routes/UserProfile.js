import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';
import {
  getAllProfiles,
  getProfile,
  upsertProfile,
  requestConnection,
  getRequests,
  handleRequest
} from '../controllers/UserProfile.js';

const router = Router();

router.get('/all', authMiddleware, getAllProfiles); // All public profiles except self
router.get('/', authMiddleware, getProfile);        // Own profile
router.post('/', authMiddleware, upload.single('profilePhoto'), upsertProfile); // Create/edit own profile

router.post('/request/:profileId', authMiddleware, requestConnection); // Request connection
router.get('/requests', authMiddleware, getRequests);                  // Invitations received
router.post('/handle-request/:requesterId', authMiddleware, handleRequest); // Approve/reject

export default router;