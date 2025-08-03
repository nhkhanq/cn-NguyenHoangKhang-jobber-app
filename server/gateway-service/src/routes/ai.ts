import express, { Router } from 'express';
import { aiChatbotController } from '@gateway/controllers/ai/ai-chatbot.controller';
import { aiRecommendationController } from '@gateway/controllers/ai/ai-recommendation.controller';

const router: Router = express.Router();

export function aiRoutes(): Router {
  
  // AI Chatbot endpoints
  router.post('/ai/chat', aiChatbotController.chatWithAI);
  router.get('/ai/chat/suggestions', aiChatbotController.getQuickSuggestions);
  
  // Content enhancement
  router.post('/ai/enhance', aiChatbotController.enhanceContent);
  
  // AI Recommendation endpoints
  router.post('/ai/recommend', aiRecommendationController.recommendGigs);
  router.get('/ai/recommend/suggestions', aiRecommendationController.getSuggestions);
  router.get('/ai/recommend/history/:userId', aiRecommendationController.getRecommendationHistory);
  router.post('/ai/recommend/feedback/:recommendationId', aiRecommendationController.provideFeedback);
  router.get('/ai/recommend/health', aiRecommendationController.healthCheck);
  
  return router;
}

export { router as aiRouter }; 