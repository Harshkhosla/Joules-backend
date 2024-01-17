const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  Title1: String,
  page1: String,
  Title2: String,
  page2: String,
  Title3: String,
  page3: String,
});

module.exports = mongoose.model('PromoCode', promoCodeSchema);
