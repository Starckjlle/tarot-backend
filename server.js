// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mercadopago = require("mercadopago");

dotenv.config();

const app = express();

// AQUI É O PONTO CRÍTICO PARA A RENDER:
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ===== ROTA DE TESTE (RAIZ) =====
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Tarot backend rodando.",
    hasToken: !!process.env.MP_ACCESS_TOKEN,
    frontendUrl: process.env.FRONTEND_URL || null,
    port: PORT,
  });
});

// ===== CONFIG MERCADO PAGO =====
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!MP_ACCESS_TOKEN) {
  console.warn("⚠️ MP_ACCESS_TOKEN não definido. Verifique nas variáveis de ambiente.");
}

mercadopago.configure({
  access_token: MP_ACCESS_TOKEN,
});

// Trata preflight CORS (OPTIONS) explicitamente
app.options("/create-preference", cors(), (req, res) => {
  res.sendStatus(200);
});

// ===== ROTA DE PAGAMENTO =====
app.post("/create-preference", async (req, res) => {
  console.log("📩 POST /create-preference recebido. Body:", req.body);

  try {
    const { method } = req.body || {};

    const preference = {
      items: [
        {
          title: "Leitura de Tarô Online",
          description:
            "Consulta completa com até 3 perguntas (Tarô + numerologia).",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 19.9,
        },
      ],
      back_urls: {
        // por enquanto, front em localhost
        success: "http://localhost:3000/?paid=1",
        pending: "http://localhost:3000/?paid=pending",
        failure: "http://localhost:3000/?paid=0",
      },
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

// ===== INICIA SERVIDOR (ESSENCIAL PARA A RENDER) =====
app.listen(PORT, () => {
  console.log(`🚀 Tarot backend ouvindo na porta ${PORT}`);
});