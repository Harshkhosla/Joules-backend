// models/CMSSchema.js
const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema({
  content: String,
});

module.exports = mongoose.model('CMS', cmsSchema);
