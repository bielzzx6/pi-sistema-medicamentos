const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const connectDB = require("./config/database");
const adminRoutes = require("./routes/adminRoutes");
const idosoRoutes = require("./routes/idosoRoutes");


// Middlewares
app.use(cors());
app.use(express.json());


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Serve arquivos estáticos do front-end
app.use(express.static(path.join(__dirname, "..", "FRONT-END")));

// Rota raiz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "FRONT-END", "index.html"));
});

// Conectar ao banco
connectDB();

// Rotas
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/idosos", require("./routes/idosoRoutes"));

module.exports = app;
