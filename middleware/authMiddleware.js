import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

    const user = await User.findById(verified.userId).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    // Attach user info including role
    req.user = {
      userId: user._id,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Token Verification Failed:", error);
    res.status(401).json({ message: "Invalid Token" });
  }
};

export default authMiddleware;
