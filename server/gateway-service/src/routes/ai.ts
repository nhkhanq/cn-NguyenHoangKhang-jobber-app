import express, { Router } from 'express';
import { aiChatbotController } from '@gateway/controllers/ai/ai-chatbot.controller';

const router: Router = express.Router();

export function aiRoutes(): Router {
  
  // AI Chatbot endpoints
  router.post('/chat', aiChatbotController.chatWithAI);
  router.get('/suggestions', aiChatbotController.getQuickSuggestions);
  
  // Content enhancement
  router.post('/enhance', aiChatbotController.enhanceContent);
  
  return router;
}

export { router as aiRouter }; 