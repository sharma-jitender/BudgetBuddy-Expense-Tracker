const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (retryCount = 0) => {
  try {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
      throw new Error(
        "MONGO_URL is not set. Please add a valid MongoDB connection string to your .env file."
      );
    }

    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    const isRetryable =
      err.name === "MongooseServerSelectionError" ||
      err.code === "ECONNREFUSED" ||
      err.code === "ETIMEDOUT";

    console.error("Error connecting to MongoDB:", err.message);

    if (isRetryable && retryCount < MAX_RETRIES) {
      console.log(
        `Retrying connection (${retryCount + 1}/${MAX_RETRIES}) in ${RETRY_DELAY_MS / 1000}s...`
      );
      console.log(
        "TIP: If this persists, add your IP to MongoDB Atlas Network Access: https://www.mongodb.com/docs/atlas/security-whitelist/"
      );
      setTimeout(() => connectDB(retryCount + 1), RETRY_DELAY_MS);
    } else {
      console.error("\n--- MongoDB Connection Failed ---");
      if (err.name === "MongooseServerSelectionError") {
        console.error(
          "Most likely cause: Your IP is not whitelisted in MongoDB Atlas."
        );
        console.error("Fix: MongoDB Atlas → Project → Network Access → Add IP Address");
        console.error(
          "  - Add your current IP, or 0.0.0.0/0 to allow all (dev only)"
        );
      }
      process.exit(1);
    }
  }
};

module.exports = connectDB;