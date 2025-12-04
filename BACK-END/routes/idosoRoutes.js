// BACK-END/routes/idosoRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/idosoController");
const upload = require("../middlewares/upload");

// LISTAR
router.get("/", controller.listar);

// BUSCAR
router.get("/:id", controller.buscar);

// CRIAR COM FOTO
router.post("/", upload.single("foto"), controller.criar);

// ATUALIZAR COM FOTO
router.put("/:id", upload.single("foto"), controller.atualizar);

// DELETAR
router.delete("/:id", controller.deletar);

module.exports = router;
