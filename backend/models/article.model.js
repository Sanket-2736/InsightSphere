const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        enum: ["Politics", "Technology", "Sports", "Health", "Business", "Entertainment"],
        required: true
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    source: {
        type: String
    }
});

module.exports = mongoose.model('Article', articleSchema);
