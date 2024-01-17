const mongoose = require('mongoose');

const catalogSchema = new mongoose.Schema({
  catalog_id: String,
  inputArea1: {
    title: String,
    subtitle1: String,
    subtitle2: String,
    image: {
      url: String,
    },
    // image1: String,
  },
  inputArea2: {
    imagelink: String,
    image: {
      buffer: Buffer,
      url: String,
    },
    // image1: String,
  },
  inputArea3: {
    Title: String,
    image: {
      buffer: Buffer,
      url: String,
    },
    // image1: String,
  },
  inputArea4: {
    imagelink: String,
    image: {
      buffer: Buffer,
      url: String,
    },
  },
  inputArea5: {
    centerText: String,
    image: {
      buffer: Buffer,
      url: String,
    },
    buttonText: String,
  }
});

module.exports = mongoose.model('Catalog', catalogSchema);
