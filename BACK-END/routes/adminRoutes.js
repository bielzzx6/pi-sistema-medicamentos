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

// Rotas 
router.get("/me", auth, async (req, res) => {
  const admin = await Admin.findById(req.adminId).select("-senha");
  res.json(admin);
});
router.put("/update", auth, async (req, res) => {
  const { nome, email, cpf, telefone, senhaAtual, novaSenha } = req.body;

  const admin = await Admin.findById(req.adminId);

  if (senhaAtual && !(await bcrypt.compare(senhaAtual, admin.senha))) {
    return res.status(400).json({ error: "Senha atual incorreta" });
  }

  admin.nome = nome;
  admin.email = email;
  admin.cpf = cpf;
  admin.telefone = telefone;

  if (novaSenha) {
    admin.senha = await bcrypt.hash(novaSenha, 10);
  }

  await admin.save();

  res.json({ message: "Perfil atualizado!" });
});
  

module.exports = router;
