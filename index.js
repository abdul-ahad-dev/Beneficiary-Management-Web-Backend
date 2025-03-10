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
app.use(express.static('public'));
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
        "https://beneficiary-management-web.vercel.app"
    ], 
    methods: ["GET", "POST", "PUT", "DELETE"], 
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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


app.get('/', (req, res) => {
    res.send('Beneficiary Management Web Backend');
});

app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


export default app;