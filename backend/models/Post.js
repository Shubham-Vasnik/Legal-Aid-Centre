const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    author:String,
    created: {type: Date, default: Date.now},
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
     ]
});

module.exports = mongoose.model("Post", blogPostSchema);