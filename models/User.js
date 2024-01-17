const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    date: String,
    time: String,
    msg_id: String,
    msg: String,
    readed: Boolean,
    sender_uid: String,
    // reciver_uid: String,
    sender_uname: String,
});

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    mobileNo: { type: String, required: true },
    mid: { type: String, unique: true },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    payment_history: { type: Number },
    purchased_items: { type: Number },
    reward_points: { type: Number },
    cashback_points: { type: Number },
    pic_url: { type: String },
    auth_code: { type: String },
    address: { type: String },
    bio: { type: String },
    birth_date: { type: Date },
    country: { type: String },
    fname: { type: String },
    gender: { type: String },
    lname: { type: String },
    phn: { type: String },
    rating: { type: String },
    zipcode: { type: String },
    kyc_status: { type: String },
    suspend_reason: { type: String },
    data: {
        messages: [messageSchema],
    },
});

module.exports = mongoose.model('User', userSchema);
