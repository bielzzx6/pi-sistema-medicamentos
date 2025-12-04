const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middlewares/auth");

// Rotas públicas
router.post("/register", adminController.register);
router.post("/login", adminController.login);

// Rotas protegidas
router.get("/dashboard", auth, (req, res) => {
  res.json({ message: "Bem-vindo à área protegida!" });
});

module.exports = router;
