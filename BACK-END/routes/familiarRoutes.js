const express = require("express");
const router = express.Router();

const familiarController = require("../controllers/familiarController");
const authMiddleware = require("../middlewares/authMiddleware");

// Todas as rotas protegidas
router.get("/", authMiddleware, familiarController.index);
router.get("/:id", authMiddleware, familiarController.show);
router.post("/", authMiddleware, familiarController.store);
router.put("/:id", authMiddleware, familiarController.update);
router.delete("/:id", authMiddleware, familiarController.destroy);

module.exports = router;
