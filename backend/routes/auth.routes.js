const {signup, viewNews, login, addToCategory, aroundTheWorldUserCategory, logout, getUserById, savePost, sendNotification} = require('../controllers/auth.controller');
const protectRoute = require('../middleware/auth.middleware')
const express = require('express');
const router = express.Router();

router.post('/login', login);
router.post('/signup', signup); 
router.post('/add-to-category/:id', protectRoute, addToCategory);
router.get('/world-news', protectRoute, aroundTheWorldUserCategory);
router.post('/view-news/:id', protectRoute, viewNews); //add the news to user history
router.get('/user/:id', getUserById);
router.post('/save-post/:id', savePost);
router.post('/logout', logout);
router.get('/notify/:id', sendNotification);

module.exports = router;