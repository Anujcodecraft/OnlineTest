// routes/auth.routes.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' })
router.post('/register',upload.single('file'), async (req, res) => {
  try {
    
    const { name, email, password, role } = req.body;
    if (!(email && password && name)) {
      return res.status(400).json({ message: 'Name, email and password required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'User already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: password, role: role || 'user' });
    await user.save();

    const token = jwt.sign({ id: user._id, email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2d' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).json({ message: 'Email and password required.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid email or password.' });

    const token = jwt.sign({ id: user._id, email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
