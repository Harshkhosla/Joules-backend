const mongoose = require('mongoose');

const headerSchema = new mongoose.Schema({
    header: String,
    brand_logo:{
        
       url: String,
        
    } 
});

module.exports = mongoose.model('header', headerSchema);