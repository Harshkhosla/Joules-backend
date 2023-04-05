const mongoose = require('mongoose');

const connectToMongo=()=>{

    
    mongoose.connect('mongodb://localhost:27017')
    console.log("Connected succesfully");
}
module.exports=connectToMongo;