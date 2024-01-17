// models/looks.js
const mongoose = require('mongoose');

const looksSchema = new mongoose.Schema({
  thumbnail: {
    buffer: Buffer,
    url: String,
  },
  slider: [
       { url: String,}    
  ],
  title: String,
  catalog_id: String  ,
});

module.exports = mongoose.model('Looks', looksSchema);
