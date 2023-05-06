const mongoose = require("mongoose");
const {Schema}= mongoose;

const UserSchema = new Schema({
   user:{
      type: mongoose.Schema.Types.ObjectId,
      ref:'user'
  }, 
 name :{
    type:String,
    require:true
 }, 
 email :{
    type:String,
    require:true,
    unique:true
 },
 password :{
    type:String,
    require:true
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
 date:{
type:Date,
default:Date.now
 }
});

module.exports=mongoose.model('user',UserSchema);