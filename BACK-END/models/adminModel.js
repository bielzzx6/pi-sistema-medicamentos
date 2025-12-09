const mongoose = require("mongoose");

const PreferenciasSchema = new mongoose.Schema(
  {
    notificacoesEmail: { type: Boolean, default: true },
    notificacoesPush: { type: Boolean, default: false },
    fusoHorario: { type: String, default: "America/Fortaleza" },
    formatoRelatorio: { type: String, default: "PDF" },
  },
  { _id: false }
);

const Admin = new mongoose.Schema({
  nome: { type: String, required: true },
  foto: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  cpf: { type: String, required: true, unique: true },
  telefone: { type: String, required: true },
  senha: { type: String, required: true },

  preferencias: {
    type: PreferenciasSchema,
    default: () => ({}),
  },
});

module.exports = mongoose.model("Admin", Admin);
