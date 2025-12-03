const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mercadopago = require("mercadopago");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors());
app.use(express.json());

// ===== MERCADO PAGO =====
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!MP_ACCESS_TOKEN) {
  console.warn("⚠️ MP_ACCESS_TOKEN não definido. Verifique o arquivo .env");
}

mercadopago.configure({
  access_token: MP_ACCESS_TOKEN,
});

// Rota básica pra testar se o servidor está no ar
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Tarot backend rodando." });
});

// Rota que o front usa para criar o pagamento
app.post("/create-preference", async (req, res) => {
  try {
    const { method } = req.body;

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
      // vamos deixar FIXO e bem simples pro ambiente local
      back_urls: {
        success: "http://localhost:3000/?paid=1",
        pending: "http://localhost:3000/?paid=pending",
        failure: "http://localhost:3000/?paid=0",
      },
      // remove o auto_return por enquanto (é ele que está dando erro)
      // auto_return: "approved",
      metadata: {
        source: "tarot-online",
        payment_method_requested: method || "not_specified",
      },
    };

    const response = await mercadopago.preferences.create(preference);

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

// (Opcional) Webhook para uso futuro
app.post("/webhook", (req, res) => {
  console.log("🔔 Webhook Mercado Pago recebido");
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`✅ Tarot backend rodando em http://localhost:${PORT}`);
});