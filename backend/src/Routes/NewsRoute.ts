import express, {Request, Response} from 'express';
import { fetchnews } from '../Controllers/NewsController';
import { getnews } from '../Controllers/NewsController';

import prisma from '../prisma';

const router = express.Router();

router.post('/fetch-news/:category', async (req: Request, res: Response) => {
    const category = req.params.category;
    console.log("Received request for category:", category);
    try {
      await fetchnews(category);
      res.status(200).send(`News fetched successfully for category: ${category}`);
    } catch (error) {
      console.error('Error in fetching news route:', error);
      res.status(500).send('Failed to fetch news');
    }
  });

router.post('/subscribe', async (req, res) => {
    const { email, category } = req.body;
  
    try {
      const user = await prisma.user.findUnique({ where: { email } });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          category,
        },
      });

      res.status(200).json({ message: 'Subscribed successfully', subscription });
    } catch (error) {
      console.error('Error subscribing:', error);
      res.status(500).json({ error: 'Failed to subscribe', details: error });
    }
  });

router.get('/news/:category?', getnews);
export default router;