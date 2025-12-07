const Admin = require("../models/adminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function register(req, res) {
  try {
    const { nome, email, cpf, telefone, senha } = req.body;

    if (!nome || !email || !cpf || !telefone || !senha) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios." });
    }

    const existingEmail = await Admin.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "E-mail já cadastrado." });
    }

    const existingCpf = await Admin.findOne({ cpf });
    if (existingCpf) {
      return res.status(400).json({ error: "CPF já cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const admin = await Admin.create({
      nome,
      email,
      cpf,
      telefone,
      senha: hashedPassword,
      preferencias: {
        notificacoesEmail: true,
        notificacoesPush: false,
        fusoHorario: "America/Fortaleza",
        formatoRelatorio: "PDF",
      },
    });

    const adminSafe = admin.toObject();
    delete adminSafe.senha;

    return res.status(201).json({
      message: "Administrador registrado com sucesso!",
      admin: adminSafe,
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao registrar administrador." });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Informe e-mail e senha." });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "E-mail não encontrado." });
    }

    const validPassword = await bcrypt.compare(senha, admin.senha);
    if (!validPassword) {
      return res.status(400).json({ error: "Senha incorreta." });
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ error: "Configuração de autenticação inválida." });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const adminSafe = admin.toObject();
    delete adminSafe.senha;

    // return res.status(200).json({
    //   message: "Login realizado!",
    //   token,
    //   admin: adminSafe,
    // });

    return res.cookie("token", token).json({ success: true });
  } catch (err) {
    return res
      .status(500)
      .json({ error: `Erro ao logar. ${JSON.stringify(err.message || err)}` });
  }
}

async function me(req, res) {
  try {
    const admin = await Admin.findById(req.adminId).select("-senha");

    if (!admin) {
      return res.status(404).json({ error: "Administrador não encontrado." });
    }

    if (!admin.preferencias) {
      admin.preferencias = {
        notificacoesEmail: true,
        notificacoesPush: false,
        fusoHorario: "America/Fortaleza",
        formatoRelatorio: "PDF",
      };
    }

    return res.json(admin);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao carregar perfil." });
  }
}

async function update(req, res) {
  try {
    const {
      nome,
      email,
      cpf,
      telefone,
      senhaAtual,
      novaSenha,
      notificacoesEmail,
      notificacoesPush,
      fusoHorario,
      formatoRelatorio,
    } = req.body;

    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({ error: "Administrador não encontrado." });
    }

    if (senhaAtual || novaSenha) {
      if (!senhaAtual || !novaSenha) {
        return res
          .status(400)
          .json({ error: "Informe senha atual e nova senha para alterá-la." });
      }

      const senhaConfere = await bcrypt.compare(senhaAtual, admin.senha);
      if (!senhaConfere) {
        return res.status(400).json({ error: "Senha atual incorreta." });
      }

      admin.senha = await bcrypt.hash(novaSenha, 10);
    }

    if (typeof nome !== "undefined") admin.nome = nome;
    if (typeof email !== "undefined") admin.email = email;
    if (typeof cpf !== "undefined") admin.cpf = cpf;
    if (typeof telefone !== "undefined") admin.telefone = telefone;

    if (!admin.preferencias) {
      admin.preferencias = {};
    }

    if (typeof notificacoesEmail !== "undefined") {
      admin.preferencias.notificacoesEmail = notificacoesEmail;
    }
    if (typeof notificacoesPush !== "undefined") {
      admin.preferencias.notificacoesPush = notificacoesPush;
    }
    if (typeof fusoHorario !== "undefined") {
      admin.preferencias.fusoHorario = fusoHorario;
    }
    if (typeof formatoRelatorio !== "undefined") {
      admin.preferencias.formatoRelatorio = formatoRelatorio;
    }

    await admin.save();

    return res.json({ message: "Perfil atualizado!" });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao atualizar perfil." });
  }
}

async function updatePhoto(req, res) {
  const admin = await Admin.findById(req.adminId);
  if (!admin)
    return res.status(404).json({ error: "Administrador não encontrado." });
  if (!req.file)
    return res.status(400).json({ error: "Nenhum arquivo enviado." });

  admin.foto = `/uploads/images/${req.file.filename}`;
  await admin.save();

  return res.json({ message: "Foto atualizada!", foto: admin.foto });
}

module.exports = {
  register,
  login,
  me,
  update,
  updatePhoto,
};
