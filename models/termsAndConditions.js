const mongoose = require('mongoose');

const termsAndConditionsSchema = new mongoose.Schema({
  content: String,
});

module.exports = mongoose.model('TermsAndConditions', termsAndConditionsSchema);
