const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  content: String,
});

module.exports = mongoose.model('Page', pageSchema);
