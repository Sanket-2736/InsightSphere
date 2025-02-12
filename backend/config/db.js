const mongoose = require('mongoose')
require('dotenv').config()
const connection_string = process.env.MONGO_URL;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(connection_string);
        console.log("Mongoose connected successfully at port : " + conn.connection.host, "\nDatabase name: ", conn.connection.name);
    } catch (error) {
        console.log("Error in connecting to database: ", error);
        process.exit(1);
    }    
}

module.exports = connectDB;