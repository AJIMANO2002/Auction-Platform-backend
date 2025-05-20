import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';


const router = express.Router();

router.get("/me", authMiddleware, (req, res) => {
    res.json({ message: "Welcome!", user: req.user });
  });
  

router.post('/register', [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be 6+ characters long")
],

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, role } = req.body;
        try {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: "User already exists" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({ name, email, password: hashedPassword, role });
            await user.save();

            const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, user: { id: user.id, name, email, role } });
        } catch (error) {
            res.status(500).json({ message: "Server Error" });
        }

    });


router.post(
    '/login',
    [
        body("email").isEmail().withMessage("Invalid Email"),
        body("password").notEmpty().withMessage("Password is required")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Invalid Credentials" });
            }

            const ismatch = await bcrypt.compare(password, user.password);
            if (!ismatch) {
                return res.status(400).json({ message: "Invalid Credentials" });
            }

            const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
        } catch (error) {
            res.status(500).json({ message: "Server Error" });
        }
    }

);

export default router;

