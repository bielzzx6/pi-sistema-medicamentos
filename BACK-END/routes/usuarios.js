// Rotas das páginas para usuários
const express = require("express");
const router = express.Router();

const usuariosController = require("../controllers/usuariosController");

// LISTAR todos os usuários
router.get("/", usuariosController.index);

// VER um usuário específico
router.get("/:id", usuariosController.show);

// CRIAR usuário
router.post("/", usuariosController.store);

// ATUALIZAR usuário
router.put("/:id", usuariosController.update);

// DELETAR usuário
router.delete("/:id", usuariosController.destroy);

module.exports = router;
