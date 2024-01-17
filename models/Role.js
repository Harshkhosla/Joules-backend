const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    // role_name: { type: String, },
    role: { type: String,  },
    rid: { type: String, required: true, unique: true },
    permissions: [{
        catg: String,
        create: Boolean,
        read: Boolean,
        update: Boolean,
        delete: Boolean,
    }],
});

module.exports = mongoose.model('Role', roleSchema);
