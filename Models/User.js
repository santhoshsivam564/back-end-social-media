const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
            // unique:true,
        },
        password:{
            type:String,
            required:true,
        },
        Followers:{
            type:[],
        },
        Following:{
            type:[],
        },
        contactno:{
             type:Number,
             required:true,
        },
        age:{
            type:Number,
            required:true,
        },
        profile:{
            type:String,
        },
    
    },
      {timestamps:true}
);

const user =mongoose.model("users", UserSchema);

module.exports = user;