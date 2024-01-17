// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    mid: String,
    pid: String,
    product_name: String,
    rating: Number,
    review: String,
    review_photo: String,
    rid: String,
    username: String
});

module.exports = mongoose.model('Review', reviewSchema);
