import { Request, Response } from 'express';
import axios from 'axios';
import prisma from '../prisma';
import { sendEmail } from './Mailer';
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
import { CronJob } from 'cron';
dotenv.config();

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

const fetchnews = async (category: string) => {
  console.log("sdf", category)
  const apiKey = process.env.NEWS_API_KEY; 
  const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&category=${category}&country=in&language=en`;

  try {
    const response = await axios.get(url);
    const articles = response.data.results;

    const savedarticles = await Promise.all(
      articles.map(async (article: any) => {
        let summaryText = '';

        try {
          const summary = await hf.summarization({
            model: 'facebook/bart-large-cnn',
            inputs: `Summarize the following news description   in less than 100 words:

            Title: ${article.title}
            Description: ${article.description || ""}`,
          });
          summaryText = summary.summary_text;
        } catch (error) {
          console.error(`Error summarizing article: ${article.title}`, error);
          summaryText = article.description || article.title;
        }

        try {
          return await prisma.article.create({
            data: {
              articleId: article.article_id || "",
              title: article.title || "",
              link: article.link || "",
              creator: article.creator || [],
              description: article.description || "",
              summary: summaryText,
              image: article.image_url || "",
              pubDate: new Date(article.pubDate) || new Date(),
              language: article.language || "",
              category: category,
            },
          });
        } catch (err) {
          console.error(`Error saving article to database: ${article.title}`, err);
          return null;
        }
      })
    );

    const article = savedarticles.filter(Boolean);

    const subscriptions = await prisma.subscription.findMany({
      where: { category: category },
      include: { user: true },
    });

    subscriptions.forEach((subscription) => {
      console.log(subscription.user.email);
      article.forEach((savedArticle: any) => {
        sendEmail(
          subscription.user.email,
          `New Article in ${category}`,
          `A new article titled ${savedArticle.title} has been added. Check it out here: ${savedArticle.link}`
        );
      });
    });

    console.log(`Articles fetched and stored successfully for category: ${category}`);
  } catch (error) {
    console.error("Error fetching news:", error);
  }
};

const newsCronJob = new CronJob(
  '51 23 * * *', 
  async () => {
    try {
      const categories = await prisma.subscription.findMany({
        select: { category: true },
        distinct: ["category"],
      });

      for (const { category } of categories) {
        await fetchnews(category);
      }
    } catch (error) {
      console.error("Error running scheduled news fetch:", error);
    }
  },
  null,
  true,
  "Asia/Kolkata"
);

newsCronJob.start();

const getnews = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;

    const articles = await prisma.article.findMany({
      where: category ? { category: String(category) } : {},
    });

    res.status(200).json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles', details: error });
  }
};

export { fetchnews, getnews };
