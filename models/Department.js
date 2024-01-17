// models/Department.js
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    department_name: { type: String, required: true },
    department_photo: { type: Buffer },
    department_photo1: { type: String },
    department_slug: { type: String },
    dept_id: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Department', departmentSchema);
