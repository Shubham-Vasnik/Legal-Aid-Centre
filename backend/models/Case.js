const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        name: String
    },
    subject:{ type: String,
        required:true,
    },
    details: { type:String,
        required:false,
    },
    mobileNo:{
        type:String,
        required:false
    },
    contactEmail:{ type:String,
            required:false,
    },
    status:{
        type:String,
        default:"open"
    },
    created: {type: Date, 
        default: Date.now}
});
module.exports = mongoose.model("Case", CaseSchema);