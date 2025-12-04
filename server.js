// server.js - TESTE MINIMAL PARA A RENDER

const express = require("express");
const cors = require("cors");

const app = express();

// Porta obrigatória: a Render injeta process.env.PORT
const PORT = process.env.PORT || 3001;

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