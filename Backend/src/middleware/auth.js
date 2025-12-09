import jwt from "jsonwebtoken"
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export default (req, res, next) => {
    const h = req.get('Authorization');
    if (!h) return next();
    const m = h.match(/^Bearer (.+)$/);
    if (!m) return next();
    try {
        const payload = jwt.verify(m[1], JWT_SECRET);
        req.user = { id: payload.sub, email: payload.email };
    } catch (err) {}
    return next();
};