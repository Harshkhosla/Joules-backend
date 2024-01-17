const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  banner_id: { type: String, unique: true },
  banner_image: {
    url: String,
  },
  banner_title: String,
  sub_title: String,
  Butt_title: String,
});

module.exports = mongoose.model('Banner', bannerSchema);
