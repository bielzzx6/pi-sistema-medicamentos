const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔥 MongoDB conectado com sucesso!");
  } catch (error) {
    console.error("❌ Erro na conexão com o MongoDB:", error);
    process.exit(1);
  }
}

module.exports = connectDB;
