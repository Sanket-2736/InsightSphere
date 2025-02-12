const { generateToken } = require('../config/utils');
const User = require('../models/user.model');
const bcryptjs = require('bcryptjs');
const cloudinary = require('../config/cloudinary');
const category = require('../constants/predictCategory');

// Login Function 
const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Please enter both username and password', success: false });
        }

        const user = await User.findOne({ username });

        console.log(user)

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        const isMatch = await bcryptjs.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        const token = generateToken(user._id, res);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user,
            userId: user._id,
            role: user.role,
        });
    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({ success: false, message: "Internal server error!" });
    }
};

// signup function
const signup = async (req, res) => {
    const { name, email, mobile, username, password, country, dob, profilePic, role } = req.body;

    try {

        if (!name || !email || !password || !mobile || !username || !country || !dob || !profilePic) {
            return res.status(400).json({ success: false, message: 'Please enter all fields' });
        }


        console.log("Exisiting user : " , existingUser)

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email ? "Email already exists!" : "Username already exists!",
            });
        }

        const hashedPassword = await bcryptjs.hash(password, 14);
        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        if (!uploadResponse.secure_url) {
            return res.status(500).json({ success: false, message: "Failed to upload profile picture!" });
        }

        const userRole = role || 'user';

        const newUser = new User({
            name, email, mobile, username,
            password: hashedPassword,
            profilePic: uploadResponse.secure_url,
            country, dob,
            role : userRole
        });

        await newUser.save();
        const token = generateToken(newUser._id, res);


        return res.status(201).json({
            success: true,
            message: "Signup successful",
            token,
            user: newUser,
            userId: newUser._id,
            role: newUser.role,
        });
    } catch (error) {
        console.error("Error in signup:", error);
        return res.status(500).json({ success: false, message: "Internal server error!" });
    }
};

// Add Category
const addToCategory = async (req, res) => {
    const userId = req.params.id;
    const { category } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { viewedCategories: category } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "Category added to your profile!" });
    } catch (error) {
        console.error("Error in adding category:", error);
        return res.status(500).json({ success: false, message: "Internal server error!" });
    }
};

// Get User-Categorized News
const aroundTheWorldUserCategory = async (req, res) => {
    const user = req.user;
    const url = `https://gnews.io/api/v4/top-headlines?topic=world&lang=en&max=10&apikey=${process.env.GNEWS_API_KEY}`;

    try {
        console.log("Inside the aroundTheWorldUserCategory()",req.user);

        const userCategories = user.viewedCategories;

        const newsResponse = await fetch(url);
        const newsData = await newsResponse.json();

        if (!newsData || !newsData.articles) {
            return res.status(500).json({ success: false, message: "Failed to fetch news, try again" });
        }

        const categorizedArticles = newsData.articles.filter(article =>
            userCategories.includes(category(article.description))
        );

        console.log(categorizedArticles);

        return res.status(200).json({ success: true, articles: categorizedArticles, message : "Articles based on your preferences" });

    } catch (error) {
        console.error("Error in fetching user categorized articles:", error);
        return res.status(500).json({ success: false, message: "Internal server error!" });
    }
};

// Get User by ID
const getUserById = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        return res.status(200).json({ success: true, message: "Profile fetched successfully!", user });
    } catch (error) {
        console.error("Error in fetching user by ID:", error);
        return res.status(500).json({ success: false, message: "Internal server error!" });
    }
};

// Save Post
const savePost = async (req, res) => {
    const userId = req.params.id;
    const { post_url, post_headline } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        if (!user.savedPages) user.savedPages = [];

        user.savedPages.push({ link: post_url, headline : post_headline });

        await user.save();

        console.log("req.body for saved post: ", req.body)

        return res.status(200).json({ success: true, message: "Post saved successfully!" });
    } catch (error) {
        console.error("Error in saving post:", error);
        return res.status(500).json({ success: false, message: "Internal server error!" });
    }
};

// saving the history of the user
const viewNews = async (req, res) => {
    const userId = req.params.id;
    const { description, newsUrl, headline } = req.body;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

  
      const predictedCategory = await category(description);
      console.log(predictedCategory);
  
      if (predictedCategory && !user.viewedCategories.includes(predictedCategory)) {
        user.viewedCategories.push(predictedCategory);
      }
  
      if (!user.history) user.history = [];
      user.history.push({ link: newsUrl, headline : headline });
  
      await user.save();
      
      return res.status(200).json({ success: true, message: "News added to history" });
    } catch (error) {
      console.error("Error in viewNews:", error);
      return res.status(500).json({ success: false, message: "Internal server error!" });
    }
};  

// logout implementation
const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge : 0, httpOnly : true});
        return res.json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        console.log("Error in logout: ", error);
        return res.json({
            success: false,
            message: "Internal server error"
        });
    }
}

// send timely notification
const sendNotification = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const notification = `Dear ${user.username}, check out today's latest news!`;

        if (!user.notifications) user.notifications = [];
        user.notifications.push(notification);
        await user.save();

        console.log(`Notification sent to ${user.username}`);
    } catch (error) {
        console.error("Error in sending notification:", error);
    }
};

// Export All Functions
module.exports = {
    signup,
    login,
    addToCategory,
    aroundTheWorldUserCategory,
    viewNews,
    getUserById,
    savePost,
    sendNotification,
    logout
};
