import mongoose from "mongoose";


const formSchema = new mongoose.Schema({
    cnic: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    depart: {
        type: String,
        required: true,
    },
    purpose: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["In Progress", "Completed", "Rejected"],
        default: "In Progress"
    },
    appointmentDateTime: {
        type: Date,
        required: true,
    },
}, { timeseries: true });

const Seeker = mongoose.model('Seeker', formSchema);

export default Seeker;
