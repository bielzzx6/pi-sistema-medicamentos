const express = require("express");
const router = express.Router();
const pacienteController = require("../controllers/pacienteController");
const auth = require("../middlewares/auth");

// Rotas protegidas
router.post("/", auth, pacienteController.create);
router.get("/", auth, pacienteController.list);
router.put("/:id", auth, pacienteController.update);
router.delete("/:id", auth, pacienteController.delete);

module.exports = router;
