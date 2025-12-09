const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");

// Rotas públicas
router.post("/register", adminController.register);
router.post("/login", adminController.login);

router.post(
  "/update-photo",
  auth,
  upload.single("foto"), // multer
  adminController.updatePhoto
);

// Rotas
router.get("/me", auth, adminController.me);

router.put("/update", auth, adminController.update);

module.exports = router;
