// BACK-END/controllers/cuidadorController.js
const Cuidador = require("../models/cuidadorModel");

module.exports = {
  async listar(req, res) {
    try {
      const { ativo } = req.query;
      const filter = {};
      if (ativo === "true") filter.ativo = true;
      if (ativo === "false") filter.ativo = false;

      const cuidadores = await Cuidador.find(filter)
        .sort({ createdAt: -1 })
        .populate("idososVinculados", "nome data_nasc");

      res.json(cuidadores);
    } catch (err) {
      console.error("Erro listar cuidadores:", err);
      res.status(500).json({ error: "Erro ao listar cuidadores." });
    }
  },

  async buscar(req, res) {
    try {
      const cuidador = await Cuidador.findById(req.params.id).populate(
        "idososVinculados",
        "nome data_nasc"
      );
      if (!cuidador)
        return res.status(404).json({ error: "Cuidador não encontrado." });
      res.json(cuidador);
    } catch (err) {
      console.error("Erro buscar cuidador:", err);
      res.status(500).json({ error: "Erro ao buscar cuidador." });
    }
  },

  async criar(req, res) {
    try {
      const body = req.body || {};

      const payload = {
        nome: body.nomeCompleto?.trim(),
        cpf: body.cpf?.trim(),
        telefone: body.telefone?.trim(),
        email: body.email?.trim(),
        funcao: body.funcao?.trim(),
        observacoes: body.observacoes?.trim(),
        ativos: body.ativo !== undefined ? Boolean(body.ativo) : undefined,
      };

      if (body.idososVinculados) {
        try {
          const arr =
            typeof body.idososVinculados === "string"
              ? JSON.parse(body.idososVinculados)
              : body.idososVinculados;
          if (Array.isArray(arr)) payload.idososVinculados = arr;
        } catch (_) {}
      }

      if (!payload.nome || !payload.cpf) {
        return res
          .status(400)
          .json({ error: "Nome e CPF são obrigatórios para o cuidador." });
      }

      const novo = await Cuidador.create(payload);
      res.status(201).json(novo);
    } catch (err) {
      console.error("Erro criar cuidador:", err);
      res.status(500).json({ error: "Erro ao criar cuidador." });
    }
  },

  async atualizar(req, res) {
    try {
      const body = req.body || {};
      const payload = {};

      if (body.nome !== undefined) payload.nome = body.nome.trim();
      if (body.cpf !== undefined) payload.cpf = body.cpf.trim();
      if (body.telefone !== undefined) payload.telefone = body.telefone.trim();
      if (body.email !== undefined) payload.email = body.email.trim();
      if (body.funcao !== undefined) payload.funcao = body.funcao.trim();
      if (body.observacoes !== undefined)
        payload.observacoes = body.observacoes.trim();
      if (body.ativo !== undefined) payload.ativo = Boolean(body.ativo);

      if (body.idosos !== undefined) {
        try {
          const arr =
            typeof body.idososVinculados === "string"
              ? JSON.parse(body.idosos)
              : body.idosos;
          if (Array.isArray(arr)) payload.idososVinculados = arr;
        } catch (_) {}
      }

      const atualizado = await Cuidador.findByIdAndUpdate(
        req.params.id,
        payload,
        { new: true }
      ).populate("idososVinculados", "nome data_nasc");

      if (!atualizado)
        return res.status(404).json({ error: "Cuidador não encontrado." });

      res.json(atualizado);
    } catch (err) {
      console.error("Erro atualizar cuidador:", err);
      res.status(500).json({ error: "Erro ao atualizar cuidador." });
    }
  },

  async deletar(req, res) {
    try {
      const cuidador = await Cuidador.findByIdAndDelete(req.params.id);
      if (!cuidador)
        return res.status(404).json({ error: "Cuidador não encontrado." });
      res.json({ message: "Cuidador removido com sucesso." });
    } catch (err) {
      console.error("Erro deletar cuidador:", err);
      res.status(500).json({ error: "Erro ao deletar cuidador." });
    }
  },

  async alterarStatus(req, res) {
    try {
      const { ativo } = req.body;
      const cuidador = await Cuidador.findByIdAndUpdate(
        req.params.id,
        { ativo: Boolean(ativo) },
        { new: true }
      );
      if (!cuidador)
        return res.status(404).json({ error: "Cuidador não encontrado." });
      res.json(cuidador);
    } catch (err) {
      console.error("Erro alterar status cuidador:", err);
      res.status(500).json({ error: "Erro ao alterar status do cuidador." });
    }
  },
};
