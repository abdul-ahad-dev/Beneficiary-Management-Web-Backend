import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import User from '../models/user.models.js';

const router = express.Router();


const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};


router.post('/signup', async (req, res) => {
    const { email, depart, password } = req.body;

    try {
        // Check if the username already exists
        const existingUseremail = await User.findOne({ email });
        if (existingUseremail)
            return res.status(400).json({ msg: 'User already exists' });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        // Create a new user
        const newUser = User({ email, depart, password: hashedPassword, role });
        await newUser.save();


        // Generate a JWT token
        const token = generateToken(newUser);

        // Set the cookie before sending the response
        res.cookie("token", token, { httpOnly: true });

        // Send the response with the token
        res.status(200).json({ msg: "User registered successfully", token });

    } catch (error) {
        res.status(500).json({ msg: "Error registering user", error: error.message });
    }
});


router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });
        console.log("user==>", user);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

        const token = generateToken(user);


        res.cookie("token", token, { httpOnly: true });
        res.status(200).json({ msg: "Login successful", token, role: user.role, depart: user.depart, id: user._id });

    } catch (error) {
        res.status(500).json({ msg: "Error logging in", error: error.message });
    }
});


export default router;