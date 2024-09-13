"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getnews = exports.fetchnews = void 0;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = __importDefault(require("../prisma"));
const Mailer_1 = require("./Mailer");
const inference_1 = require("@huggingface/inference");
const dotenv_1 = __importDefault(require("dotenv"));
const cron_1 = require("cron");
dotenv_1.default.config();
const hf = new inference_1.HfInference(process.env.HUGGING_FACE_API_KEY);
const fetchnews = (category) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("sdf", category);
    const apiKey = process.env.NEWS_API_KEY;
    const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&category=${category}&country=in&language=en`;
    try {
        const response = yield axios_1.default.get(url);
        const articles = response.data.results;
        const savedarticles = yield Promise.all(articles.map((article) => __awaiter(void 0, void 0, void 0, function* () {
            let summaryText = '';
            try {
                const summary = yield hf.summarization({
                    model: 'facebook/bart-large-cnn',
                    inputs: `Summarize the following news description   in less than 100 words:

            Title: ${article.title}
            Description: ${article.description || ""}`,
                });
                summaryText = summary.summary_text;
            }
            catch (error) {
                console.error(`Error summarizing article: ${article.title}`, error);
                summaryText = article.description || article.title;
            }
            try {
                return yield prisma_1.default.article.create({
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
            }
            catch (err) {
                console.error(`Error saving article to database: ${article.title}`, err);
                return null;
            }
        })));
        const article = savedarticles.filter(Boolean);
        const subscriptions = yield prisma_1.default.subscription.findMany({
            where: { category: category },
            include: { user: true },
        });
        subscriptions.forEach((subscription) => {
            console.log(subscription.user.email);
            article.forEach((savedArticle) => {
                (0, Mailer_1.sendEmail)(subscription.user.email, `New Article in ${category}`, `A new article titled ${savedArticle.title} has been added. Check it out here: ${savedArticle.link}`);
            });
        });
        console.log(`Articles fetched and stored successfully for category: ${category}`);
    }
    catch (error) {
        console.error("Error fetching news:", error);
    }
});
exports.fetchnews = fetchnews;
const newsCronJob = new cron_1.CronJob('59 17 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prisma_1.default.subscription.findMany({
            select: { category: true },
            distinct: ["category"],
        });
        for (const { category } of categories) {
            yield fetchnews(category);
        }
    }
    catch (error) {
        console.error("Error running scheduled news fetch:", error);
    }
}), null, true, "Asia/Kolkata");
newsCronJob.start();
const getnews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category } = req.params;
        const articles = yield prisma_1.default.article.findMany({
            where: category ? { category: String(category) } : {},
        });
        res.status(200).json(articles);
    }
    catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Failed to fetch articles', details: error });
    }
});
exports.getnews = getnews;
