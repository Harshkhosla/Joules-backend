const mongoose = require("mongoose");


const QuestionSchema = new Schema({
 homeCurrent :{
    type:String,
    require:true
 }, 
 voltage :{
    type:String,
    require:true,
    
 },
 password :{
    type:String,
    require:true
 },
});

module.exports=mongoose.model('question',QuestionSchema);