import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    depart: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "depart"],
        default: "depart"
    }
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

export default User;