import express from "express";
import {
  getMe,
  signUp,
  logIn,
  logOut,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();
router.get("/getme", protectRoute, getMe);
router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/logout", logOut);

export default router;
