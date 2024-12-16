import { protectRoute } from "../middleware/protectRoute.js";
import express from "express";
import {
  deleteAllNotification,
  getAllNotifications,
  deleteANotification,
} from "../controllers/notification.controller.js";
const router = express.Router();

router.get("/", protectRoute, getAllNotifications);
router.delete("/", protectRoute, deleteAllNotification);
router.delete("/:id", protectRoute, deleteANotification);

export default router;
