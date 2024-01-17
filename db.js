const mongoose = require('mongoose');
// const mongoURI = "mongodb://localhost:27017";
const mongoURI = "mongodb+srv://harsh:Harsh9945khosla@cluster0.osfevs6.mongodb.net/test";

const ConnectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
    }
};

module.exports = ConnectToMongo;
