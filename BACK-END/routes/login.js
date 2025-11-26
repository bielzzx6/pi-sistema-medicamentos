const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// Redireciona raiz
router.get("/", (req, res) => res.redirect("/login"));

// Tela de login
router.get("/login", authController.showLogin);

// Processa login
router.post("/login", authController.login);

// Tela home
router.get("/home", authController.home);

// Logout
router.post("/logout", authController.logout);

module.exports = router;
