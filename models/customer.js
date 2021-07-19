const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  sex: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    default: 30,
    max: [150],
  },
  product: {
    health: {
      type: Number,
      min: 0,
    },
    saving: {
      type: Number,
      min: 0,
    },
  },
  lastbuy: {
    type: Date,
  },
  author: String,
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
