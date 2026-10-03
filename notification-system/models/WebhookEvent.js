const mongoose = require("mongoose");

const webhookEventSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  customer: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("WebhookEvent", webhookEventSchema);