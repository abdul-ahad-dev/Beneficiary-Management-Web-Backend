import express from 'express';
import 'dotenv/config';
import User from '../models/user.models.js';

const router = express.Router();



router.get('/', async (req, res) => {
    try {
        const allUser = await User.find({}, 'fullName email');
        const totalCount = await User.countDocuments()

        res.status(200).json({ msg: "Get All Us Successfully", users: allUser, totalCount });
    } catch (error) {
        res.status(500).json({ msg: "Error can't get all user", error: error.message });
    }
});




router.delete('/', async (req, res) => {
    const { username, email } = req.body;

    // Check if either username or email is provided in the request
    if (!email)
        return res.status(400).json({ msg: "Please provide either username or email" });

    try {
        // Find the user by username or email
        const user = await User.findOne({ email });

        // If no user is found
        if (!user)
            return res.status(404).json({ msg: "User not found" });

        // Delete the user
        await User.deleteOne({ _id: user._id });

        // Send success response
        res.status(200).json({ msg: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ msg: "Error deleting user", error: error.message });
    }
});


export default router;