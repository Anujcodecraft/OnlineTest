// middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden. Invalid token.' });
      }
      req.user = user; // user contains id, email, role
      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized. Token missing.' });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden. Admins only.' });
  }
};
