import mongoose from "mongoose";

const userQueryModel = mongoose.Schema({
    contactNo:{
        type:Number
    },
    emailId:{
        type:String,
        require:true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
    },
    query:{
        type:String,
    },
    isResolved:{
        type:Boolean,
        default:false
    }
},{ timestamps: true })


export default mongoose.model('userQuery', userQueryModel);