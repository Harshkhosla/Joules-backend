const mongoose = require("mongoose");
const {Schema}= mongoose;

const QuestionSchema = new Schema({
   user:{
      type: mongoose.Schema.Types.ObjectId,
      ref:'user'
  }, 
 homeCurrent :{
    type:String,
    require:true
 }, 
 voltage :{
    type:String,
    require:true,
    
 },
 question :{
    type:String,
    require:true
 },
});

module.exports=mongoose.model('question',QuestionSchema);