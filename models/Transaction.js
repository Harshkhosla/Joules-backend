// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  status: String,
  amt: Number, //reward pints
  date: String,
  time: String,
  mid: String,
  transaction_id: {
    type: String,
    unique: true,
  },
  oid:String
});

module.exports = mongoose.model('Transaction', transactionSchema);
