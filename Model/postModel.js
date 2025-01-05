import mongoose from "mongoose";

const postModel = new mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    files:[{
        fileName: { type: String, required: true },
        url: { type: String }
    }],
    price:{
        type:String,
    },
    category:{
        type:String,
        enum:[
            'Interio Designing Service','Building Construction Service','Architectural Designing Service','Interior Design',
            'Interior Service','Office Interior Designing Service','Full House Interior','L Shape Modular Kitchen','Modular Kitchen',
            'Modular Kitchen Service','Lab Furniture & Lab Design','3D Interior Rendering Service'
        ]
    }
},{timestamps: true})

export default mongoose.model("post",postModel)