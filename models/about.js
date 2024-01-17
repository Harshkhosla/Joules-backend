const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  AboutBanner: {
    title: String,
    description: String,
    image: {
      url: String,
    },
  },
  title1: {
    title: String,
    description: String,
  },
  title2: {
    title: String,
    description: String,
  },
  MissionSection: {
    title: String,
    description: String,
    image: {
      url: String,
    },
  },
  VisionSection: {
    title: String,
    description: String,
    image: {
      url: String,
    },
  },
  SEOArea: {
    MetaTitle: String,
    MetaDescription: String,
    MetaKeywords: String,
    images: {
      url: String,
    },
  },
});

module.exports = mongoose.model('About', aboutSchema);
