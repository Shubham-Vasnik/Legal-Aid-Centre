const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now},
});

module.exports = mongoose.model("Activity", ActivitySchema);