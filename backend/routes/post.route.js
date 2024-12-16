import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createPost,
  deletePost,
  commentOnPost,
  likeUnlikePost,
  getAllPost,
  getLikedPost,
  getFollowingsPosts,
  getUserPosts,
  deleteUserComment
} from "../controllers/post.controller.js";
const router = express.Router();

router.post("/create", protectRoute, createPost);
router.get("/all", protectRoute, getAllPost);
router.get("/following", protectRoute, getFollowingsPosts);
router.get("/like/:userId", protectRoute, getLikedPost);
router.get("/user/:userName", protectRoute, getUserPosts);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.post("/profile/:username/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);
router.delete("/:postId/comments/:commentId",protectRoute,deleteUserComment)

export default router;
