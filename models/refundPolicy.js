const mongoose = require('mongoose');

const refundPolicySchema = new mongoose.Schema({
  content: String,
});

module.exports = mongoose.model('RefundPolicy', refundPolicySchema);
