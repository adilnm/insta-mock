const mongoose = require("mongoose");
const{ObjectId}=mongoose.Schema.Types // Build relatinship between post and user

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    },
    photo:{
        type:String,
        defauly:"no photo"
    },
    postedBy:{
        type:ObjectId,
        ref:"User"
    }

})

mongoose.model("Post",postSchema)
