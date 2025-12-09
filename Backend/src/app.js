import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import apiRoutes from "./routes/api.js";
import redirectRoutes from "./routes/redirect.js";
import auth from "./middleware/auth.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const app = express();

//basic middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(
    {
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",

            //Add Prod URL
            "https://ichishort-frontend.onrender.com"
        ]
    }
));

//health (must be before redirect routes to avoid slug matching)
app.get('/health', (req, res) => {
    res.json({ ok: true });
});

//routes
app.use(auth);
app.use('/api', apiRoutes);
app.use('/', redirectRoutes);

//connect DB (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(MONGO_URI).then( () => {
        console.log("MongoDB connected");
    }).catch(err => {
        console.error("Mongo connection error: ", err);
    });
}

export default app;