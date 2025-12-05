// server.js - TESTE MINIMAL PARA A RENDER (VERSÃO CORRETA)

const express = require("express");
const cors = require("cors");

const app = express();

// Porta obrigatória para a Render.
// LOCAL: 4000
// NA RENDER: ela injeta process.env.PORT automaticamente.
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ===== ROTA DE TESTE =====
app.get("/", (req, res) => {
  res.send(`OK da Render! Servidor rodando na porta ${PORT}`);
});

// ===== INICIANDO SERVIDOR =====
app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste ouvindo na porta ${PORT}`);
});