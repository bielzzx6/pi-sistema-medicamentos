const mongoose = require("mongoose");

const PacienteSchema = new mongoose.Schema({
  nome: String,
  idade: Number,
  cpf: String,
  telefone: String,
  endereco: String,
});

module.exports = mongoose.model("Paciente", PacienteSchema);
