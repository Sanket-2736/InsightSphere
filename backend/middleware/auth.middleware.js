const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protectRoute = async (req, res, next) => {
    try {
        // Retrieve the token from cookies
        const token = req.cookies.jwt;

        if (!token) {
            console.log("Token not found!");
            return res.status(401).json({ success: false, message: 'Authentication token missing. Please log in.' });
        }


        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded);
        } catch (error) {
            console.log("Invalid token:", error.message);
            return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
        }

        // Find the user in the database
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            console.log("User not found");
            return res.status(401).json({ success: false, message: 'User associated with this token does not exist.' });
        }

        // Attach the user to the request object
        req.user = user;        

        // Proceed to the next middleware or route
        next();
    } catch (error) {
        console.error("Error in authentication:", error);
        res.status(500).json({ success: false, message: "Authentication failed. Please try again later." });
    }
};

module.exports = protectRoute;
