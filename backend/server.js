import express from "express";
import authRoute from "./routes/auth.route.js";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import { v2 as cloudinary } from "cloudinary";
import postRoute from "./routes/post.route.js";
import notificationRoute from "./routes/notification.route.js";
import cors from "cors";
import path from "path";
const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
cloudinary.config({
  cloud_name: process.env.CLOUDYNARY_NAME,
  api_key: process.env.CLOUDYNARY_API_KEY,
  api_secret: process.env.CLOUDYNARY_API_SECRET,
});

const corsOptions = {
  origin: "*", // Frontend development URL (default for Vite)
  methods: "GET, POST, PUT, DELETE", // Allowed HTTP methods
  credentials: true,
  allowedHeaders: "Content-Type, Authorization", // Allowed headers
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/posts", postRoute);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  connectMongoDB();
  console.log(`server started ${PORT} `);
});
