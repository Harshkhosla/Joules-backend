const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({
  SEOArea: {
    MetaTitle: String,
    MetaDescription: String,
    MetaKeywords: String,
    images: {
      url: String,
    },
  },
  Banner1: [{
    // BannerTitle: String,
    // ButtonLink: String,
    image: {
      url: String,
    },
  }],
  OfferArea: {
    Title: String,
    Name: String,
    Offer: String,
    Subtitle: String,
    image: {
      url: String,
    },
    image1: {
      url: String,
    },
  },
  CollectionArea: {
    BannerTitle: String,
    images: [
      {
        url: String,
      }
    ],
  },
  EventArea: {
    image: {
      url: String,
    },
    image2: {
      url: String,
    },
    imagelink: String,
  },
  GridArea: {
    image1: {
      url: String,
    },
    title1: String,
    link1: String,
    image2: {
      url: String,
    },
    title2: String,
    link2: String,
    image3: {
      url: String,
    },
    title3: String,
    link3: String,
    image4: {
      url: String,
    },
    title4: String,
    link4: String,
  },
});

module.exports = mongoose.model('Home', homeSchema);
