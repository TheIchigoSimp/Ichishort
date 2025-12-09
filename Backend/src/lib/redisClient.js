import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL;

const client = new Redis({
    host: "127.0.0.1",
    port: 6379
});
client.on('error', (err) => {
    console.error('Redis error', err);
});

export default client;