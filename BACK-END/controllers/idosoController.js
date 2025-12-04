// BACK-END/controllers/idosoController.js
const Idoso = require("../models/idosoModel");
const fs = require("fs");
const path = require("path");

function tryParseJSON(value) {
  if (!value) return null;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    return value; // se não for JSON, retorna a string original
  }
}

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d) ? null : d;
}

module.exports = {
  async listar(req, res) {
    try {
      const idosos = await Idoso.find().sort({ createdAt: -1 });
      return res.json(idosos);
    } catch (err) {
      console.error("Erro listar idosos:", err);
      return res.status(500).json({ error: "Erro ao listar idosos." });
    }
  },

  async buscar(req, res) {
    try {
      const idoso = await Idoso.findById(req.params.id);
      if (!idoso) return res.status(404).json({ error: "Idoso não encontrado." });
      return res.json(idoso);
    } catch (err) {
      console.error("Erro buscar idoso:", err);
      return res.status(500).json({ error: "Erro ao buscar idoso." });
    }
  },

  async criar(req, res) {
    try {
      // Se multipart/form-data via multer: req.body contém strings (arrays JSON em string)
      // Se application/json: req.body já é objeto/arrays
      const raw = req.body || {};

      // parse campos que podem vir como JSON-string
      const contatos = tryParseJSON(raw.contatos) || tryParseJSON(raw.contato) || [];
      const doencas = tryParseJSON(raw.doencas) || tryParseJSON(raw.doencas) || [];
      const medicamentos = tryParseJSON(raw.medicamentos) || [];
      const cuidadores = tryParseJSON(raw.cuidadores) || [];
      const sinais_vitais = tryParseJSON(raw.sinais_vitais) || [];

      // montar objeto final
      const payload = {
        nome: raw.nome || raw.nome === "" ? String(raw.nome).trim() : "",
        data_nasc: toDate(raw.data_nasc),
        telefone: raw.telefone || "",
        informacoes: raw.informacoes || "",
        contatos: Array.isArray(contatos) ? contatos : [],
        doencas: Array.isArray(doencas) ? doencas : [],
        medicamentos: Array.isArray(medicamentos) ? medicamentos : [],
        cuidadores: Array.isArray(cuidadores) ? cuidadores : [],
        sinais_vitais: Array.isArray(sinais_vitais) ? sinais_vitais : [],
      };

      // foto (se enviada via multer)
      if (req.file) {
        payload.foto = `/uploads/idosos/${req.file.filename}`;
      }

      // validação mínima
      if (!payload.nome) {
        return res.status(400).json({ error: "Nome é obrigatório." });
      }

      const novo = await Idoso.create(payload);
      return res.status(201).json(novo);
    } catch (err) {
      console.error("Erro criar idoso:", err);
      return res.status(500).json({ error: "Erro ao criar idoso." });
    }
  },

  async atualizar(req, res) {
    try {
      const raw = req.body || {};

      const contatos = tryParseJSON(raw.contatos) || tryParseJSON(raw.contato) || [];
      const doencas = tryParseJSON(raw.doencas) || [];
      const medicamentos = tryParseJSON(raw.medicamentos) || [];
      const cuidadores = tryParseJSON(raw.cuidadores) || [];
      const sinais_vitais = tryParseJSON(raw.sinais_vitais) || [];

      const payload = {};

      if (raw.nome !== undefined) payload.nome = String(raw.nome).trim();
      if (raw.data_nasc !== undefined) payload.data_nasc = toDate(raw.data_nasc);
      if (raw.telefone !== undefined) payload.telefone = raw.telefone;
      if (raw.informacoes !== undefined) payload.informacoes = raw.informacoes;

      if (Array.isArray(contatos)) payload.contatos = contatos;
      if (Array.isArray(doencas)) payload.doencas = doencas;
      if (Array.isArray(medicamentos)) payload.medicamentos = medicamentos;
      if (Array.isArray(cuidadores)) payload.cuidadores = cuidadores;
      if (Array.isArray(sinais_vitais)) payload.sinais_vitais = sinais_vitais;

      // foto
      if (req.file) {
        payload.foto = `/uploads/idosos/${req.file.filename}`;
      }

      // Atualiza e retorna o novo documento
      const atualizado = await Idoso.findByIdAndUpdate(req.params.id, payload, { new: true });

      if (!atualizado) return res.status(404).json({ error: "Idoso não encontrado." });

      return res.json(atualizado);
    } catch (err) {
      console.error("Erro atualizar idoso:", err);
      return res.status(500).json({ error: "Erro ao atualizar idoso." });
    }
  },

  async deletar(req, res) {
    try {
      const id = req.params.id;
      const idoso = await Idoso.findByIdAndDelete(id);
      if (!idoso) return res.status(404).json({ error: "Idoso não encontrado." });

      // opcional: remover foto do disco
      if (idoso.foto) {
        const filePath = path.join(__dirname, "..", idoso.foto);
        fs.unlink(filePath, (err) => {
          // não bloquear a resposta por erro ao deletar arquivo
          if (err) console.warn("Erro ao remover foto do disco:", err.message);
        });
      }

      return res.json({ message: "Idoso removido com sucesso." });
    } catch (err) {
      console.error("Erro deletar idoso:", err);
      return res.status(500).json({ error: "Erro ao deletar idoso." });
    }
  },
};
