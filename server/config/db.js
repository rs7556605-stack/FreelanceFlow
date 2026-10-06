const dns = require("dns");
const mongoose = require("mongoose");

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

dns.setDefaultResultOrder("ipv4first");

const connectDB = async () => {
  try {
    console.log("Connecting MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      family: 4,
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 15000,
    });

    console.log("MongoDB Connected ✅");

  } catch (error) {
    console.error("MongoDB Connection Error ❌");
    console.error("Name:", error.name);
    console.error("Code:", error.code);
    console.error("Message:", error.message);

    if (error.reason) {
      console.error("Reason:", error.reason);
    }

    process.exit(1);
  }
};

module.exports = connectDB;