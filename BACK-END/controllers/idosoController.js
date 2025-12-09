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

/**
 * Normalize a field that can arrive as:
 * - JSON string: "[{...},{...}]"
 * - JSON string: "{...}"
 * - already parsed array or object
 * - undefined / empty
 */
function normalizeArrayField(raw, keys) {
  for (const key of keys) {
    if (raw[key] === undefined) continue;

    const parsed = tryParseJSON(raw[key]);

    if (Array.isArray(parsed)) return parsed;

    if (parsed && typeof parsed === "object") {
      // single object -> wrap in array
      return [parsed];
    }

    // if it is a non-empty string, but not valid JSON, skip to next key
  }
  return [];
}

/**
 * Build payload object from raw body and optional file.
 * Used by both "criar" and "atualizar" to keep behavior consistent.
 */
function buildIdosoPayload(raw, file, isUpdate = false) {
  const contatos = normalizeArrayField(raw, ["contatos", "contato"]);
  const doencas = normalizeArrayField(raw, ["doencas"]);
  const medicamentos = normalizeArrayField(raw, ["medicamentos"]);
  const cuidadores = normalizeArrayField(raw, ["cuidadores"]);
  const sinais_vitais = normalizeArrayField(raw, ["sinais_vitais"]);

  const payload = {};

  // Basic fields
  if (!isUpdate || raw.nome !== undefined) {
    payload.nome = raw.nome !== undefined ? String(raw.nome).trim() : "";
  }

  if (!isUpdate || raw.data_nasc !== undefined) {
    payload.data_nasc =
      raw.data_nasc !== undefined ? toDate(raw.data_nasc) : null;
  }

  if (!isUpdate || raw.telefone !== undefined) {
    payload.telefone = raw.telefone || "";
  }

  if (!isUpdate || raw.informacoes !== undefined) {
    payload.informacoes = raw.informacoes || "";
  }

  // Arrays – if front sent the field, we always override
  if (!isUpdate || raw.contatos !== undefined || raw.contato !== undefined) {
    payload.contatos = Array.isArray(contatos) ? contatos : [];
  }

  if (!isUpdate || raw.doencas !== undefined) {
    payload.doencas = Array.isArray(doencas) ? doencas : [];
  }

  if (!isUpdate || raw.medicamentos !== undefined) {
    payload.medicamentos = Array.isArray(medicamentos) ? medicamentos : [];
  }

  if (!isUpdate || raw.cuidadores !== undefined) {
    payload.cuidadores = Array.isArray(cuidadores) ? cuidadores : [];
  }

  if (!isUpdate || raw.sinais_vitais !== undefined) {
    payload.sinais_vitais = Array.isArray(sinais_vitais) ? sinais_vitais : [];
  }

  // Photo
  if (file) {
    payload.foto = `/uploads/images/${file.filename}`;
  }

  return payload;
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
      const raw = req.body || {};

      const payload = buildIdosoPayload(raw, req.file, false);

      // minimal validation
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

      // useful to debug what is arriving from front-end
      // console.log("RAW BODY:", raw);
      // console.log("RAW doencas:", raw.doencas);

      const payload = buildIdosoPayload(raw, req.file, true);

      // Only send update if we have at least one key
      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: "Nada para atualizar." });
      }

      const atualizado = await Idoso.findByIdAndUpdate(req.params.id, payload, {
        new: true,
      });

      if (!atualizado) {
        return res.status(404).json({ error: "Idoso não encontrado." });
      }

      return res.json(atualizado);
    } catch (err) {
      console.error("Erro atualizar idoso:", err);
      return res.status(500).json({ error: "Erro ao atualizar idoso." });
    }
  },

  async deletar(req, res) {
    try {
      const idoso = await Idoso.findByIdAndDelete(req.params.id);
      if (!idoso) {
        return res.status(404).json({ error: "Idoso não encontrado." });
      }

      // optional: remove photo from disk
      if (idoso.foto) {
        const filePath = path.join(__dirname, "..", idoso.foto);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.warn("Erro ao remover foto do disco:", err.message);
          }
        });
      }

      return res.json({ message: "Idoso removido com sucesso." });
    } catch (err) {
      console.error("Erro deletar idoso:", err);
      return res.status(500).json({ error: "Erro ao deletar idoso." });
    }
  },
};
