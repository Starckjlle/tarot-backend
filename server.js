// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mercadopago = require("mercadopago");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware básico
app.use(cors());              // libera CORS pra qualquer origem
app.use(express.json());

// LOG simples pra ver se subiu
console.log("Inicializando servidor Tarot Backend...");

// ===== TESTE RÁPIDO / SAÚDE =====
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Tarot backend rodando.",
    hasToken: !!process.env.MP_ACCESS_TOKEN,
    frontendUrl: process.env.FRONTEND_URL || null,
  });
});

// ===== CONFIG MERCADO PAGO =====
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!MP_ACCESS_TOKEN) {
  console.warn("⚠️ MP_ACCESS_TOKEN não definido. Verifique nas variáveis de ambiente da Render.");
}

mercadopago.configure({
  access_token: MP_ACCESS_TOKEN,
});

// Trata o preflight CORS explicitamente pra rota de pagamento
app.options("/create-preference", cors(), (req, res) => {
  res.sendStatus(200);
});

// ===== ROTA QUE O FRONT USA =====
app.post("/create-preference", async (req, res) => {
  console.log("📩 POST /create-preference recebido. Body:", req.body);

  try {
    const { method } = req.body || {};

    const preference = {
      items: [
        {
          title: "Leitura de Tarô Online",
          description: "Consulta completa com até 3 perguntas (Tarô + numerologia).",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 19.9,
        },
      ],
      back_urls: {
        success: "http://localhost:3000/?paid=1",      // por enquanto em localhost
        pending: "http://localhost:3000/?paid=pending",
        failure: "http://localhost:3000/?paid=0",
      },
      // retirado auto_return pra evitar chatice de validação
      metadata: {
        source: "tarot-online",
        payment_method_requested: method || "not_specified",
      },
    };

    console.log("🧾 Enviando preferência ao Mercado Pago...");
    const response = await mercadopago.preferences.create(preference);

    console.log("✅ Preferência criada:", response.body.id);

    return res.json({
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point,
      preference_id: response.body.id,
    });
  } catch (error) {
    console.error("❌ Erro ao criar preferência Mercado Pago:");
    console.error(error);

    return res.status(500).json({
      error: "Erro ao criar preferência de pagamento.",
      details: error?.message || String(error),
    });
  }
});

// ===== (Opcional) Webhook =====
app.post("/webhook", (req, res) => {
  console.log("🔔 Webhook Mercado Pago recebido");
  res.sendStatus(200);
});

// ===== INICIA SERVIDOR =====
app.listen(PORT, () => {
  console.log(`🚀 Tarot backend ouvindo na porta ${PORT}`);
});