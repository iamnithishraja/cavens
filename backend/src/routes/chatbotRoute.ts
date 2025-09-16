import express from 'express';
import { chatWithBot, getChatbotSuggestions } from '../controllers/chatbotController';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// Chat with the AI bot
router.post('/chat', isAuthenticated, chatWithBot);

// Get chatbot suggestions and popular events
router.get('/suggestions', isAuthenticated, getChatbotSuggestions);

export default router;
