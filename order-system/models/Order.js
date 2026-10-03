const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
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

module.exports = mongoose.model("Order", orderSchema);