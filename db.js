const mongoose = require('mongoose');

const connectToMongo=()=>{

    // mongodb://localhost:27017
    // mongodb+srv://harsh:Harsh9945khosla@cluster0.osfevs6.mongodb.net/test
    mongoose.connect('mongodb://localhost:27017')
    console.log("Connected succesfully");
}
module.exports=connectToMongo;