import express from "express";
import {createUrl, getUrl, listUrls} from "../controllers/url.controller.js";
import {register, login} from "../controllers/auth.controller.js";
import apiRateLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

// auth
router.post('/auth/register', register);
router.post('/auth/login', login);


// urls
router.get('/urls', listUrls);
router.post('/urls', apiRateLimiter, createUrl);
router.get('/urls/:slug', getUrl);

export default router;