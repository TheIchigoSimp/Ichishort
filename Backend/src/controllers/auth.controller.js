import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken"
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;


export const register = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });
    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ error: 'user exists' });
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash: hash });
        return res.json({ id: user._id, email: user.email });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'server error' });
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid Email' });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Incorrect password' });
        const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
        return res.json({ token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server Error' });
    }
};
