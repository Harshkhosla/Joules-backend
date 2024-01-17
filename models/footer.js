    // models/footer.js
    const mongoose = require('mongoose');

    const quickLinkSchema = new mongoose.Schema({
        Name: String,
        page: String,
    });

    const footerSchema = new mongoose.Schema({
        Title: String,
        Subtitle: String,
        QuickLinks: [quickLinkSchema],
        facebook: String,
        twitter: String,
        insta: String,
        footer: String,
    });

    module.exports = mongoose.model('Footer', footerSchema);
