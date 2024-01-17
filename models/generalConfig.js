const mongoose = require('mongoose');

const generalConfigSchema = new mongoose.Schema({
  cashbackPointRate: String,
  rewardPointRate: String,
  shippingCharges: String,
  otherCharges: String,
  newsletter: String,
});

module.exports = mongoose.model('GeneralConfig', generalConfigSchema);
