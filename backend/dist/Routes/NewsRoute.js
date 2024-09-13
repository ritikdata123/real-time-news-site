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
const express_1 = __importDefault(require("express"));
const NewsController_1 = require("../Controllers/NewsController");
const NewsController_2 = require("../Controllers/NewsController");
const prisma_1 = __importDefault(require("../prisma"));
const router = express_1.default.Router();
router.post('/fetch-news/:category', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const category = req.params.category;
    console.log("Received request for category:", category);
    try {
        yield (0, NewsController_1.fetchnews)(category);
        res.status(200).send(`News fetched successfully for category: ${category}`);
    }
    catch (error) {
        console.error('Error in fetching news route:', error);
        res.status(500).send('Failed to fetch news');
    }
}));
router.post('/subscribe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, category } = req.body;
    try {
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const subscription = yield prisma_1.default.subscription.create({
            data: {
                userId: user.id,
                category,
            },
        });
        res.status(200).json({ message: 'Subscribed successfully', subscription });
    }
    catch (error) {
        console.error('Error subscribing:', error);
        res.status(500).json({ error: 'Failed to subscribe', details: error });
    }
}));
router.get('/news/:category?', NewsController_2.getnews);
exports.default = router;
