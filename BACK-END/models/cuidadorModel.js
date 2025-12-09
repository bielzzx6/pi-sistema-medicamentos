// BACK-END/models/cuidadorModel.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const CuidadorSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    cpf: { type: String, required: true, trim: true, unique: true },
    telefone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    funcao: { type: String, trim: true },
    observacoes: { type: String, trim: true },
    idososVinculados: [{ type: Schema.Types.ObjectId, ref: "Idoso" }],
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cuidador", CuidadorSchema);
