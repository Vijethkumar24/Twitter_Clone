import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MONGODB connected${conn.connection.host}`);
  } catch (error) {
    console.log(`Error:Connection Failure:${error}`);
    process.exit(0);
  }
};
export default connectMongoDB;
