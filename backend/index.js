import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import cors from 'cors';
import User from './models/User.js';
import Test from './models/Test.js';
import Assessment from './models/Assessment.js';
import {connectDB} from './database/db.js'

import authRoutes from './Routes/auth.js';
import testRoutes from './Routes/test.js';
import assessmentRoutes from './Routes/assessment.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/assessment', assessmentRoutes);

// Home Route
app.get('/', (req, res) => {
  res.send('Welcome to the MERN Test Platform API');
});

const PORT = process.env.PORT || 5000;
const connectWithRetry = () => {
    connectDB()
        .then(() => {
            // If the connection is successful, we start the server
            app.listen(PORT, () => {
                console.log(`Server is running on port: ${PORT}`);
            });
        })
        .catch((err) => {
            // If there's an error, log the error and exit the process
            console.error("❌ MongoDB connection failed:", err.message);
            process.exit(1); // Exit with a failure code
        });
};

// Call the function to connect to MongoDB
connectWithRetry();
