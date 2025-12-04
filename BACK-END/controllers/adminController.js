const Admin = require("../models/adminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  async register(req, res) {
    try {
      const { nome, email, cpf, telefone, senha } = req.body;

      // Verificar se o email já existe
      const exist = await Admin.findOne({ email });
      if (exist) {
        return res.status(400).json({ error: "E-mail já cadastrado." });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(senha, 10);

      const admin = await Admin.create({
        nome,
        email,
        cpf,
        telefone,
        senha: hashedPassword,
      });

      return res.status(201).json({ message: "Administrador registrado com sucesso!", admin });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao registrar administrador." });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ error: "E-mail não encontrado." });
      }

      const validPassword = await bcrypt.compare(senha, admin.senha);
      if (!validPassword) {
        return res.status(400).json({ error: "Senha incorreta." });
      }

      // Criar token
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).json({ message: "Login realizado!", token });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao logar." });
    }
  },
};
