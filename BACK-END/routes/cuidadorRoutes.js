// BACK-END/routes/cuidadorRoutes.js

const express = require("express");
const router = express.Router();
const controlador = require("../controllers/cuidadorController");

// listar todos
router.get("/", controlador.listar);

// buscar um cuidador por ID
router.get("/:id", controlador.buscar);

// criar cuidador
router.post("/", controlador.criar);

// atualizar cuidador
router.put("/:id", controlador.atualizar);

// remover cuidador
router.delete("/:id", controlador.deletar);

// alterar status ativo/inativo
router.patch("/:id/status", controlador.alterarStatus);

module.exports = router;
