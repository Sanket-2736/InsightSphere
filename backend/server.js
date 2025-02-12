const express = require('express');
const app = express();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const User = require('./models/user.model');
const {sendNotification} = require('./controllers/auth.controller');
const cron = require('node-cron');

app.use(cookieParser());
app.use(bodyParser.json({limit : '20mb'}))
app.use(express.json())
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
app.use(cors({
    origin: ['http://localhost:5173'], // Replace with your frontend URL
    credentials: true,
}));
require('dotenv').config();

app.use('/api/auth', authRoutes);

connectDB().then(() => {
    console.log("Connected to MongoDB!\n");
}).catch(err => console.error("MongoDB Connection failed: ", err));

app.listen(process.env.PORT, () => {
    console.log(`\n\nServer running at: http://localhost:${process.env.PORT}`);
});

// Schedule notification at 6 AM every day
cron.schedule('0 6 * * *', async () => {
    console.log("Running scheduled notification task at 6 AM...");

    try {
        const users = await User.find(); // Fetch all users
        for (const user of users) {
            await sendNotification(user._id); // Call function directly
        }
        console.log("Notifications sent successfully.");
    } catch (error) {
        console.error("Error in scheduled notification task:", error);
    }
}, {
    timezone: "Asia/Kolkata"
});

process.on('SIGINT', async () => {
    console.log("Shutting down server...");
    await mongoose.disconnect();
    process.exit(0);
});