const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  max_discount_amount: Number,
  minimum_shopping: Number,
  offer: Number,
  offer_type: {
    type: String,
    enum: ['Price', 'Percent'],
  },
  offer_valid_from: String,
  offer_valid_upto: String,
  price: Number,
  products: [String],
  promo_id: {
    type: String,
    unique: true,
  },
  promotion_code: {
    type: String,
    unique: true,
  },
  promotion_title: String,
  promotion_type: {
    type: String,
    enum: ['Product', 'Shipping'],
  },
});

module.exports = mongoose.model('Promotion', promotionSchema);
