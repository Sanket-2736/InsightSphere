require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const categories = [
    "environment", "science", "education", "lifestyle", "travel", 
    "fashion", "food", "real estate", "automotive", "cryptocurrency",
    "human interest", "international", "weather", "gaming", "culture",
    "opinion", "law", "history", "philosophy", "social issues", "entertainment"
];

const category = async (desc) => {
    try {
        console.log(process.env.GEMINI_API_KEY);
        const prompt = `This is the description of a news article. Predict its category among the following: ${categories.join(", ")}. Provide only one word as the response. Description: ${desc}`;
        console.log(prompt);

        const res = await model.generateContent(prompt);
        const responseText = (res.response.text()).toLowerCase().trim();

        if (!responseText) {
            throw new Error("No response received from the model.");
        }

        if (!categories.includes(responseText)) {
            console.warn(`Unexpected category: ${responseText}`);
            return null;
        }

        console.log(responseText);
        return responseText;
    } catch (error) {
        console.error("Error predicting category in predictCategory.js:", error);
        return null;
    }
};

module.exports = category;
