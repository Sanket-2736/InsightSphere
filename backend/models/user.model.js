const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: Number, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    country: { type: String, required: true, default: "India" },
    profilePic: { type: String, required: true },
    dob: { type: Date, required: true, default: Date.now },
    viewedCategories: {  
        type: [String], 
        default: ["entertainment"],
        enum: [
            "environment", "science", "education", "lifestyle", "travel", 
            "fashion", "food", "real estate", "automotive", "cryptocurrency",
            "human interest", "international", "weather", "gaming", "culture",
            "opinion", "law", "history", "philosophy", "social issues", "entertainment"
        ]        
    },
    role: { type: String, default: "user", enum: ["user", "admin"] },
    savedPages: [{
        headline: { type: String },
        link: { type: String },
        saved: { type: Date, default: Date.now }
    }],
    history: [{
        headline: { type: String },
        link: { type: String },
        saved: { type: Date, default: Date.now }
    }],
    notifications: [{  
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('User', userSchema);
