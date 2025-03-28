import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MONGODB connected${conn.connection.host}`);
     setInterval(async () => {
      try {
        await mongoose.connection.db.command({ ping: 1 });
        console.log("✅ MongoDB Pinged to Prevent Sleep");
      } catch (error) {
        console.error("⚠️ MongoDB Ping Error:", error);
      }
    }, 10 * 60 * 1000);
  } catch (error) {
    console.log(`Error:Connection Failure:${error}`);
    process.exit(0);
  }
};
export default connectMongoDB;
