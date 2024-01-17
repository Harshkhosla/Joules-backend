const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  email: String,
  contactNo: String,
  phoneNo: String,
  address: String,
  officeAddress: String,
  SEOArea: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    images: Buffer,
    images1: String,
  },
});

module.exports = mongoose.model('Contact', contactSchema);
