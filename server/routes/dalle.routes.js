import express from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const router = express.Router();

const AI_HORDE_API_KEY = process.env.HORDE_API_KEY;

router.route('/').get((req, res) => {
    res.status(200).json({ message: "Hello from AI Horde ROUTES" });
});

router.route('/').post(async (req, res) => {
    try {
        const { prompt } = req.body;

        const response = await axios.post(
            'https://stablehorde.net/api/v2/generate/async',
            {
                prompt: prompt,
                params: {
                    n: 1,
                    width: 512,
                    height: 512,
                    steps: 20
                },
                nsfw: false,
                censor_nsfw: true
            },
            {
                headers: {
                    'apikey': AI_HORDE_API_KEY,
                    'Client-Agent': 'Anubhav Singh'
                }
            }
        );

        const { id } = response.data;

        const pollImage = async () => {
            const poll = await axios.get(`https://stablehorde.net/api/v2/generate/status/${id}`, {
                headers: {
                    'apikey': AI_HORDE_API_KEY,
                    'Client-Agent': 'YourAppNameHere'
                }
            });

            if (poll.data.done && poll.data.generations.length > 0) {
                const imgData = poll.data.generations[0].img;
                return imgData;
            } else {
                await new Promise(res => setTimeout(res, 3000));
                return await pollImage();
            }
        };

        const image = await pollImage();

        res.status(200).json({ photo: image });
    } catch (error) {
        console.error(error?.response?.data || error.message);
        res.status(500).json({ message: "Failed to generate image using AI Horde" });
    }
});

export default router;
