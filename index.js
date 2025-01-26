import express from 'express'
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config'
import userRoutes from './api/routes/user.js'
import authRoutes from './api/routes/auth.js'
import seekerRoutes from './api/routes/seeker.js'

const app = express();
app.use(morgan('tiny'));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allows cookies to be sent
}));


const port = process.env.PORT || 4040;



app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/seeker', seekerRoutes);




mongoose
    .connect(process.env.MONGODBURI)
    .then(() => { console.log("Connected to MongoDB"); })
    .catch((err) => { console.log("Error connecting to MongoDB", err); }
    );


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});