import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/request/:profileId", authMiddleware, async (req, res) => {
  res.json({ success: true, message: "Connection request sent!" });
});

export default router;