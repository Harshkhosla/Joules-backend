// models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    site_name: { type: String },
    portal_url: { type: String },
    admin_email: { type: String },
    support_mail: { type: String },
    primary_color: { type: String },
    secondary_color: { type: String },
    background_color: { type: String },
    smtp_details: {
        host: String,
        port: String,
        username: String,
        password: String,
    },
});



//  header    
// unsuspend


module.exports = mongoose.model('Settings', settingsSchema);
