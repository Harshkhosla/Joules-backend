const mongoose = require('mongoose');

const privacyPolicySchema = new mongoose.Schema({
  content: String,
});

module.exports = mongoose.model('PrivacyPolicy', privacyPolicySchema);
