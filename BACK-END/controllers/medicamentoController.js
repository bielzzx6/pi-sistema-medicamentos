// controllers/medicamentoController.js
const Medicamento = require("../models/medicamentoModel");

// helper simples pra número
function toNumber(val, fallback = null) {
  if (val === undefined || val === null || val === "") return fallback;
  const n = Number(val);
  return Number.isNaN(n) ? fallback : n;
}

// helper para normalizar lista de IDs de idosos
function parseIdososVinculados(raw) {
  if (raw === undefined || raw === null || raw === "") return undefined;

  let arr = raw;
  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      // se vier "id1,id2,id3"
      arr = raw.split(",").map((s) => s.trim());
    }
  }

  if (!Array.isArray(arr)) return undefined;

  return arr
    .map((v) => (v ? String(v).trim() : ""))
    .filter((v) => v.length > 0);
}

module.exports = {
  async listar(req, res) {
    try {
      const meds = await Medicamento.find()
        .sort({ createdAt: -1 })
        .populate("idososVinculados", "nome data_nasc");

      res.json(meds);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao listar medicamentos." });
    }
  },

  async buscar(req, res) {
    try {
      const med = await Medicamento.findById(req.params.id).populate(
        "idososVinculados",
        "nome data_nasc"
      );

      if (!med) {
        return res.status(404).json({ error: "Medicamento não encontrado." });
      }
      res.json(med);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao buscar medicamento." });
    }
  },

  async criar(req, res) {
    try {
      const body = req.body || {};

      const estoqueInicial = toNumber(
        body.estoqueInicial ?? body.estoque_inicial ?? body.estoque,
        0
      );

      const estoque = toNumber(
        body.estoque ?? body.estoqueAtual ?? body.estoque_atual,
        estoqueInicial
      );

      const idososVinculados = parseIdososVinculados(
        body.idososVinculados ?? body.idosos
      );

      const payload = {
        nome: body.nome,
        classificacao: body.classificacao,
        medico: body.medico,
        especialidade: body.especialidade,
        estoqueInicial,
        estoque,
        instrucoes: body.instrucoes,
        horarios: JSON.parse(body.horarios || "[]"),
      };

      if (idososVinculados) {
        payload.idososVinculados = idososVinculados;
      }

      if (req.file) {
        payload.foto = `/uploads/images/${req.file.filename}`;
      }

      const novo = await Medicamento.create(payload);
      res.status(201).json(novo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao criar medicamento." });
    }
  },

  async atualizar(req, res) {
    try {
      const body = req.body || {};

      const novoEstoqueInicial = toNumber(
        body.estoqueInicial ?? body.estoque_inicial,
        null
      );

      const novoEstoque = toNumber(
        body.estoque ?? body.estoqueAtual ?? body.estoque_atual,
        null
      );

      const payload = {
        nome: body.nome,
        classificacao: body.classificacao,
        medico: body.medico,
        especialidade: body.especialidade,
        instrucoes: body.instrucoes,
      };

      if (body.horarios !== undefined) {
        payload.horarios = JSON.parse(body.horarios || "[]");
      }

      if (novoEstoqueInicial !== null) {
        payload.estoqueInicial = novoEstoqueInicial;
      }

      if (novoEstoque !== null) {
        payload.estoque = novoEstoque;
      }

      const idososVinculados = parseIdososVinculados(
        body.idososVinculados ?? body.idosos
      );
      if (idososVinculados !== undefined) {
        payload.idososVinculados = idososVinculados;
      }

      if (req.file) {
        payload.foto = `/uploads/images/${req.file.filename}`;
      }

      const atualizado = await Medicamento.findByIdAndUpdate(
        req.params.id,
        payload,
        { new: true }
      ).populate("idososVinculados", "nome data_nasc");

      if (!atualizado) {
        return res.status(404).json({ error: "Medicamento não encontrado." });
      }

      res.json(atualizado);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao atualizar medicamento." });
    }
  },

  async deletar(req, res) {
    try {
      const med = await Medicamento.findByIdAndDelete(req.params.id);
      if (!med) {
        return res.status(404).json({ error: "Não encontrado" });
      }
      res.json({ message: "Medicamento removido." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao deletar medicamento." });
    }
  },
};
