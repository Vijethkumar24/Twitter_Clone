import Post from "../model/post.model.js";
import User from "../model/user.model.js";
import { Notification } from "../model/notification.model.js";
import { v2 as cloudinary } from "cloudinary";
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "user not found" });
    if (!text && !img)
      return res.status(400).json({ error: "post must have text or img" });
    if (img) {
      const updatedResponse = await cloudinary.uploader.upload(img);
      img = updatedResponse.secure_url;
    }
    const newPost = new Post({
      user: userId,
      text,
      img,
    });
    await newPost.save();
    return res.status(200).json(newPost);
  } catch (error) {
    return res.status(400).json({ error: "Internal Server Error" });
  }
};
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ error: "post not found" });
    if (post.user.toString() !== req.user._id.toString())
      return res
        .status(400)
        .json({ error: "your not authorized to delete the post" });
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(req.params.id);
    // await Post.save();
    return res.status(200).json({ message: "post deleted Sucessfully" });
  } catch (error) {
    return res.status(400).json({ error: "Internal Server Error" });
  }
};

export const deleteUserComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body;
    if (!userId || !commentId || !postId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the user is authorized to delete the comment
    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (
      comment.user.toString() !== userId &&
      post.user.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ error: "You're not authorized to delete this comment" });
    }

    // Filter out the comment to delete it
    post.comments = post.comments.filter(
      (c) => c._id.toString() !== commentId
    );

    // Save the updated post
    await post.save();

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    console.log("im being called");
    const { text, img } = req.body; // Accept text and optional img
    const postId = req.params.id; // Extract postId from request parameters
    const userId = req.user._id; // Authenticated user's ID

    // Validate text content
    if (!text?.trim()) {
      return res.status(400).json({ error: "Comment text cannot be empty" });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Handle image upload if an image is provided
    let imgUrl = null;
    if (img) {
      try {
        const uploadedResponse = await cloudinary.uploader.upload(img, {
          folder: 'comments', // You can specify the folder where images will be stored
        });
        imgUrl = uploadedResponse.secure_url; // The Cloudinary URL of the uploaded image
      } catch (error) {
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    // Create the new comment with or without the image URL
    const newComment = { 
      user: userId, 
      text, 
      img: imgUrl // Store the Cloudinary URL if an image was uploaded
    };

    // Add comment to the post's comments array
    post.comments.push(newComment);
    await post.save();

    // Return success response with the new comment
    return res.status(201).json({ 
      message: "Comment added successfully", 
      comment: newComment, 
      postId 
    });
  } catch (error) {
    console.error("Error in commentOnPost:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      return res.status(200).json(updatedLikes);
    } else {
      // Like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      const updatedLikes = post.likes;
      return res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length == 0) return res.status(200).json([]);
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(404).json({ error: "Internal Server Error" });
  }
};
export const getLikedPost = async (req, res) => {
  try {
    const { userId: userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "user not found" });
    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    return res.status(200).json(likedPosts);
  } catch (error) {
    return res.status(404).json({ error: "Internal Server Error" });
  }
};
export const getFollowingsPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "user not found" });
    const following = user.following;
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    return res.status(200).json(feedPosts);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getUserPosts = async (req, res) => {
  try {
    const { userName: username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "user not found" });
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
