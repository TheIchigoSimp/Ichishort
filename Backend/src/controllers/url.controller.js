import Url from "../models/url.js";
import generate from "../utils/base62.js";
import client from "../lib/redisClient.js";

export const createUrl = async (req, res) => {
    try {
        const { target, customSlug } = req.body;
        if(!target) return res.status(400).json({ error: 'target required' });

        // very basic validation
        if (!/^https?:\/\//i.test(target)) {
            return res.status(400).json({ error: 'target must start with http:// or https://' });
        }
    
        let slug = (customSlug || '').trim() || generate(6);
    
        if (customSlug) {
            const exists = await Url.findOne({ slug });
            if (exists) return res.status(409).json({ error: 'Custom slug taken' });
        } else {
            // avoid collisions with a few attempts
            let attempts = 0;
            while (await Url.findOne({ slug })) {
                slug = generate(6);
                if (++attempts > 5) return res.status(500).json({ error: 'slug gen failed' });
            }
        }
    
        const doc = await Url.create({ slug, target, ownerId: req.user?.id || null });
        await client.set(`slug:${slug}`, JSON.stringify(doc), 'EX', 3600);
    
        return res.json({ shortUrl: `${process.env.BASE_URL}/${slug}`, slug });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'server error' });
    }
};

export const listUrls = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'authentication required' });
        }

        const urls = await Url.find({ ownerId: req.user.id })
            .sort({ createdAt: -1 })
            .lean();

        return res.json(urls);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'server error' });
    }
};
    
export const getUrl = async (req, res) => {
    const { slug } = req.params;
    const doc = await Url.findOne({ slug }).lean();
    if (!doc) return res.status(404).json({ error: 'not found' });
    return res.json(doc);
};
