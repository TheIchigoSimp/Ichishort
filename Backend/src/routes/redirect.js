import express from "express";
import Url from "../models/url.js";
import redis from "../lib/redisClient.js";
import push from "../lib/clickQueue.js";

const router = express.Router();

router.get('/:slug', async(req, res) => {
    const { slug } = req.params;
    const cacheKey = `slug:${slug}`;
    try{
        const cached = await redis.get(cacheKey);
        let doc;
        if(cached) {
            doc = JSON.parse(cached);
        } else {
            doc = await Url.findOne({ slug }).lean();
            if(!doc){
                return res.status(404).send('Not Found');
            }
            await redis.set(cacheKey, JSON.stringify(doc), 'EX', 3600);
        }

        //push lightweight click event
        push({ slug, at: new Date(), ip: req.ip, ua: req.get('User-Agent') });
        //increment lightweight redis counter
        redis.incr(`stats:slug:${slug}`);

        return res.redirect(doc.target);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Server Error');
    }
});

export default router;