const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const Order = require("./models/Order");

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

function createSignature(payload) {
  return crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");
}

async function sendWebhook(order) {
  const payload = {
    event: "order.created",
    orderId: order._id.toString(),
    customer: order.customer,
    amount: order.amount
  };

  const signature = createSignature(payload);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Webhook attempt ${attempt}`);

      await axios.post(process.env.WEBHOOK_URL, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-webhook-signature": signature
        },
        timeout: 3000
      });

      console.log("Webhook delivered successfully");
      return;
    } catch (error) {
      console.log(`Webhook attempt ${attempt} failed`);

      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  console.log("Webhook delivery failed after 3 attempts");
}

app.post("/orders", async (req, res) => {
  try {
    const { customer, amount } = req.body;

    if (!customer || amount === undefined) {
      return res.status(400).json({
        message: "Customer and amount are required"
      });
    }

    const order = await Order.create({
      customer,
      amount
    });

    sendWebhook(order);

    res.status(201).json({
      message: "Order created successfully",
      order
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create order"
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Order System running on port ${process.env.PORT}`);
});