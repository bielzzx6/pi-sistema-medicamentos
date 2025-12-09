// BACK-END/routes/idosoRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/idosoController");
const upload = require("../middlewares/upload");
const auth = require("../middlewares/auth");

// LISTAR
router.get("/", auth, controller.listar);

// BUSCAR
router.get("/:id", auth, controller.buscar);

router.post("/", auth, upload.single("foto"), controller.criar);

// ATUALIZAR COM FOTO
router.put("/:id", auth, upload.single("foto"), controller.atualizar);

// DELETAR
router.delete("/:id", auth, controller.deletar);

module.exports = router;
