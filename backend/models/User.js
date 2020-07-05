const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type:String,
        required:true,
    },
    lastName: {
        type:String,
        required:false,
    },
    email: {
        type:String,
        required:true,
    },
    password: {
        type:String,
        required:true,
    },
    role: {
        type:String,
        default:'basic',
    },
    cases: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Case"
        }
    ]
});

module.exports = mongoose.model('User',UserSchema);
