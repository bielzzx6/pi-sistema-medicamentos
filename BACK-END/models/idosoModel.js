const mongoose = require("mongoose");

const IdosoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    data_nasc: { type: Date, required: true },
    telefone: { type: String, required: false },
    foto: { type: String, default: "" },
    informacoes: { type: String, default: "" },

    contatos: [
      {
        nome: String,
        telefone: String
      }
    ],

    doencas: [
      {
        diagnostico: String,
        data: Date,
        medico: String,
        observacoes: String
      }
    ],

    medicamentos: [
      {
        nome: String,
        dose: String,
        horario: String,
        ativo: { type: Boolean, default: true }
      }
    ],

    cuidadores: [
      {
        nome: String,
        telefone: String
      }
    ],

    sinais_vitais: [
      {
        data: Date,
        hora: String,
        pressao_sistolica: Number,
        pressao_diastolica: Number,
        batimentos: Number,
        temperatura: Number,
        saturacao: Number,
        peso: Number,
        glicemia: Number,
        observacoes: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Idoso", IdosoSchema);
