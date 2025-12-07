const express = require("express");
const cors = require("cors");
const path = require("path");
var cookieParser = require("cookie-parser");

const app = express();

const connectDB = require("./config/database");
const adminRoutes = require("./routes/adminRoutes");
const idosoRoutes = require("./routes/idosoRoutes");
const systemRoutes = require("./routes/systemRoutes");
const medicamentoRoutes = require("./routes/medicamentoRoutes");
const cuidadorRoutes = require("./routes/cuidadorRoutes");

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Serve arquivos estáticos do front-end
app.use(express.static(path.join(__dirname, "..", "FRONT-END")));

// Rota raiz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "FRONT-END", "index.html"));
});

// Conectar ao banco
connectDB();

// Rotas
app.use("/api/admin", adminRoutes);
app.use("/api/idosos", idosoRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/medicamentos", medicamentoRoutes);
app.use("/api/cuidadores", cuidadorRoutes);

module.exports = app;
