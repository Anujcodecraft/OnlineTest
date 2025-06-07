// db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// const MONGO_URI = process.env.MONGO_URI;

export const connectDB = async () => {
  mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));
}
