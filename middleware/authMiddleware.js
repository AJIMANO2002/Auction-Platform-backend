import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Extract token after 'Bearer '

  try {
    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID (decoded from token)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user info to request
    req.user = {
      userId: user._id,
      role: user.role,
    };

    next(); // Proceed to next middleware or route
  } catch (error) {
    console.error("Token Verification Failed:", error.message);
    return res.status(401).json({ message: "Invalid Token" });
  }
};

export default authMiddleware;
