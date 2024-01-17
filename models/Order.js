const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    pid: { type: String },
    product_name: { type: String },
    price: { type: String },
    photo1: { type: Buffer }, // Changed to Buffer for binary data
    photo: { type: String }, // Changed to Buffer for binary data  
    count: { type: String },
    reward_points: { type: Number },
});

const orderSchema = new mongoose.Schema({
    mid: { type: String },
    oid: { type: String },
    amount: { type: Number },
    payment_mode: { type: String },
    tracking_id: { type: String },
    delivery_status: { type: String },
    payment_status: { type: String },
    email: { type: String },
    shipping_addr: { type: String },
    contact: { type: String },
    uname: { type: String },
    coupon: { type: Number },
    shipping: { type: Number },
    subtotal: { type: Number },
    tax: { type: Number },
    promotion_id: { type: String },
    products: [productSchema],
    date:{type: String},
    time:{type: String},
});

module.exports = mongoose.model('Order', orderSchema);
