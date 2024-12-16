import User from "../model/user.model.js";
import { Notification } from "../model/notification.model.js";
import bycrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User Not Found!!!" });
    } else return res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ error: "Internal Server Error" });
  }
};
export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res.status(404).json({ error: "Cannot Follow/Unfollow Urself" });
    }
    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: "User Not Found" });
    }
    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      await User.findByIdAndUpdate(id, { $pull: { following: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      const newNotification = new Notification({
        type: "follow",
        from: userToModify._id,
        to: req.user._id,
      });
      await newNotification.save();
      return res.status(200).json({ message: "user unfollowed" });
    } else {
      await User.findByIdAndUpdate(id, { $push: { following: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });
      await newNotification.save();
      return res.status(200).json({ message: "user followed" });
    }
  } catch (error) {
    return res
      .status(404)
      .json({ error: "Error In Following / Unfollowing The User" });
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await User.findById(userId).select("following");
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUser = filteredUsers.slice(0, 4);
    suggestedUser.forEach((user) => (user.password = null));
    return res.status(200).json({ suggestedUser });
  } catch (error) {
    return res.status(500).json({ error: "Please Try Again Later" });
  }
};

export const updateUserProfile = async (req, res) => {
  const {
    fullname,
    username,
    email,
    currentPassword,
    newPassword,
    bio,
    link,
    profileImg,
    coverImg,
  } = req.body;
  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Password update validation
    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        message:
          "Password error: please provide both current and new passwords",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bycrypt.compare(currentPassword, user.password);
      if (!isMatch)
      {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "New password must be at least 6 characters long" });
      }

      const salt = await bycrypt.genSalt(10);
      user.password = await bycrypt.hash(newPassword, salt);
    }

    // Profile image update
    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const updatedResponse = await cloudinary.uploader.upload(profileImg);
      user.profileImg = updatedResponse.secure_url;
    }

    // Cover image update
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const updatedResponse = await cloudinary.uploader.upload(coverImg);
      user.coverImg = updatedResponse.secure_url;
    }
    console.log(bio);

    // Updating other fields
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    await user.save();
    user.password = null; // To avoid sending password in response

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Error updating user" });
  }
};
