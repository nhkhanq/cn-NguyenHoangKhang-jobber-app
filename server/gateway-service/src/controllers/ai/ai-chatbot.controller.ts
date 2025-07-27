import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  chatHistory?: ChatMessage[];
  context?: 'gig' | 'order' | 'general' | 'payment';
}

class AIChatbotController {
  
  /**
   * Main chatbot endpoint
   */
  async chatWithAI(req: Request, res: Response): Promise<void> {
    try {
      const { message, chatHistory = [], context = 'general' }: ChatRequest = req.body;

      if (!message || message.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Message is required',
          success: false
        });
        return;
      }

      // System prompt based on context
      const systemPrompt = this.getSystemPrompt(context);
      
      // Prepare messages for OpenAI
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-5), // Keep last 5 messages for context
        { role: 'user', content: message }
      ];

      // Get AI response
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages as any,
        max_tokens: 300,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

      res.status(StatusCodes.OK).json({
        message: 'AI response generated successfully',
        success: true,
        data: {
          response: aiResponse,
          context: context,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('AI Chatbot Error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error processing AI request',
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Quick suggestions for common questions
   */
  async getQuickSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const suggestions = [
        'How do I create a gig?',
        'How to place an order?',
        'Payment methods available?',
        'How does the review system work?',
        'What is crypto payment?',
        'How to become a seller?',
        'How to contact support?'
      ];

      res.status(StatusCodes.OK).json({
        message: 'Quick suggestions retrieved',
        success: true,
        data: { suggestions }
      });

    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error retrieving suggestions',
        success: false,
        error: error.message
      });
    }
  }

  /**
   * AI content enhancement for gig descriptions
   */
  async enhanceContent(req: Request, res: Response): Promise<void> {
    try {
      const { content, type = 'gig' } = req.body;

      if (!content || content.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Content is required',
          success: false
        });
        return;
      }

      const prompt = this.getEnhancementPrompt(type);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: content }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const enhancedContent = completion.choices[0]?.message?.content || content;

      res.status(StatusCodes.OK).json({
        message: 'Content enhanced successfully',
        success: true,
        data: {
          original: content,
          enhanced: enhancedContent,
          type: type
        }
      });

    } catch (error: any) {
      console.error('Content Enhancement Error:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error enhancing content',
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get system prompt based on context
   */
  private getSystemPrompt(context: string): string {
    const basePrompt = `You are a helpful AI assistant for Jobber, a freelance marketplace platform. You help users with questions about the platform.`;
    
    const contextPrompts = {
      gig: `${basePrompt} Focus on helping with gig creation, management, and optimization. Provide practical advice about pricing, descriptions, and best practices.`,
      order: `${basePrompt} Focus on order management, delivery process, requirements, and communication between buyers and sellers.`,
      payment: `${basePrompt} Focus on payment methods including traditional payments and crypto payments. Explain the escrow system and payment security.`,
      general: `${basePrompt} Provide general help about platform features, account management, and how to get started.`
    };

    return contextPrompts[context as keyof typeof contextPrompts] || contextPrompts.general;
  }

  /**
   * Get enhancement prompt based on content type
   */
  private getEnhancementPrompt(type: string): string {
    const prompts = {
      gig: `You are an expert copywriter specializing in freelance marketplace gig descriptions. Improve the following gig description to make it more professional, SEO-friendly, and compelling to potential buyers. Keep it concise but comprehensive. Include clear value propositions and call-to-action.`,
      requirement: `You are an expert at writing clear project requirements. Improve the following requirement description to make it more detailed, specific, and actionable for freelancers. Ensure all necessary information is included.`,
      message: `You are an expert at professional communication. Improve the following message to make it more professional, clear, and friendly for business communication.`
    };

    return prompts[type as keyof typeof prompts] || prompts.gig;
  }
}

export const aiChatbotController = new AIChatbotController(); 