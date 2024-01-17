const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryName: String,
  image: Buffer,
  images1: String,
});

module.exports = mongoose.model('Category', categorySchema);
