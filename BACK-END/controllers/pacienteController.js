const Paciente = require("../models/pacienteModel");

module.exports = {
  async create(req, res) {
    try {
      const paciente = await Paciente.create(req.body);
      return res.status(201).json(paciente);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar paciente" });
    }
  },

  async list(req, res) {
    try {
      const pacientes = await Paciente.find();
      return res.json(pacientes);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar pacientes" });
    }
  },

  async update(req, res) {
    try {
      const id = req.params.id;
      const atualizado = await Paciente.findByIdAndUpdate(id, req.body, { new: true });
      return res.json(atualizado);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar paciente" });
    }
  },

  async delete(req, res) {
    try {
      const id = req.params.id;
      await Paciente.findByIdAndDelete(id);
      return res.json({ message: "Paciente removido" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao deletar paciente" });
    }
  }
};
