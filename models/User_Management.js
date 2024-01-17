// models/User_Management.js
const mongoose = require('mongoose');

const userManagementSchema = new mongoose.Schema({
    uname: { type: String,required: true, unique: true },
    email: { type: String },
    pass: { type: String, required: true },
    role: { type: String,  },
    status: { type: String, default: 'Unassign' },
    contact: { type: String },
    dept_id: { type: String, unique: true },
    department:{type:String},
    pic_url: { type: String ,default: 'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg'},
    uid: { type: String, unique: true },
    suspend_reason: { type: String },
    suspended: { type: Boolean ,default: false},
    department:{type:String}
});

module.exports = mongoose.model('User_Management', userManagementSchema);
