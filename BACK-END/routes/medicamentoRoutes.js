const express = require("express");
const router = express.Router();
const controller = require("../controllers/medicamentoController");
const upload = require("../middlewares/upload.js");

router.get("/", controller.listar);
router.get("/:id", controller.buscar);

router.post("/", upload.single("foto"), controller.criar);
router.put("/:id", upload.single("foto"), controller.atualizar);

router.delete("/:id", controller.deletar);

module.exports = router;
