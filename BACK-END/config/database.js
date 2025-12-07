const mongoose = require("mongoose");
// require("dotenv").config();

async function connectDB() {
  try {
    console.log(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      autoCreate: true,
      appName: "pi-sistema-medicamentos",
      dbName: "pi-sistema-medicamentos",
    });
    console.log("🔥 MongoDB conectado com sucesso!");
  } catch (error) {
    console.error("❌ Erro na conexão com o MongoDB:", error);
    process.exit(1);
  }
}

module.exports = connectDB;
