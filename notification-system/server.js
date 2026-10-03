const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
require("dotenv").config();

const WebhookEvent = require("./models/WebhookEvent");

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

function verifySignature(payload, signature) {
  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

app.post("/webhook/order-created", async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];

    if (!verifySignature(req.body, signature)) {
      console.log("Invalid webhook signature");

      return res.status(401).json({
        message: "Invalid signature"
      });
    }

    console.log("Received webhook:");
    console.log(req.body);

    await WebhookEvent.create(req.body);

    res.status(200).json({
      message: "Webhook received successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to process webhook"
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Notification System running on port ${process.env.PORT}`);
});