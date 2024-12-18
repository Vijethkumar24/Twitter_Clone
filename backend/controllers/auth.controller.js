import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookies } from "../lib/utils/generateTokenNsetCookies.js";

export const signUp = async (req, res) => {
  try {
    const { email, username, fullname, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 6 characters long And Should Have 1 or More Uppercase letter ,1 or More LowerCase,And a special Character ",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookies(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const logIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    const Users = await User.findOne({ username });
    const isValidpass = await bcrypt.compare(password, Users?.password || "");
    if (!Users || !isValidpass) {
      return res.status(400).json({ error: "Invalid Credentials" });
    } else {
      await generateTokenAndSetCookies(Users._id, res);
      return res.status(200).json({
        _id: Users._id,
        username: Users.username,
        fullname: Users.fullname,
        email: Users.email,
        profileImg: Users.profileImg,
        coverImg: Users.coverImg,
        bio: Users.bio,
        followers: Users.followers,
        following: Users.following,
        link: Users.link,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server error" });
  }
};
export const logOut = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true, // Ensure it matches the original cookie's settings
      sameSite: "None", // Necessary for cross-origin setups
      secure: true, // Only over HTTPS
      expires: new Date(0), // Set expiry to a past date
    });
    return res.status(200).json({ message: "Logged Out Sucessfully" });
  } catch (error) {
    console.log("server error", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    return res.status(500).json({ error: "Internal Server error" });
  }
};
