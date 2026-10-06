require("dotenv").config();

const mongoose = require("mongoose");

async function testMongo() {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      family: 4,
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB Connected Successfully ✅");

    await mongoose.connection.db.admin().ping();

    console.log("MongoDB Ping Successful ✅");

    await mongoose.disconnect();

    console.log("MongoDB Disconnected");
    process.exit(0);
  } catch (error) {
    console.error("MongoDB Test Failed ❌");
    console.error("Name:", error.name);
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    process.exit(1);
  }
}

testMongo();