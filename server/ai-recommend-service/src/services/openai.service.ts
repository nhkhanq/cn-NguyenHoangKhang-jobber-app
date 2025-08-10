import OpenAI from 'openai'
import { config } from '@ai/config'
import { Logger } from 'winston'
import { IAISearchIntent } from '@ai/interfaces/recommendation.interface'
import { createLogger } from '@ai/logger'

const log: Logger = createLogger('aiRecommendServiceOpenAI')

class OpenAIService {
  private openai?: OpenAI

  constructor() {
    if (config.USE_OPENAI === 'true' && !config.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required when USE_OPENAI=true')
    }
    
    if (config.USE_OPENAI === 'true' && config.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: config.OPENAI_API_KEY
      })
    }
  }

  async extractSearchIntent(query: string): Promise<IAISearchIntent> {
    // Force OpenAI usage - no fallback allowed
    if (config.USE_OPENAI !== 'true' || !this.openai) {
      throw new Error('OpenAI is required but not properly configured. Please check OPENAI_API_KEY and USE_OPENAI settings.')
    }

    try {
      const prompt = `
        Extract structured information from this freelance service request:
        "${query}"
        
        Analyze and return JSON with:
        - category: main service category (e.g., "Web Development", "Graphic Design", "Writing")
        - subcategory: specific service type (e.g., "Logo Design", "E-commerce Website")
        - keywords: array of important terms and phrases
        - budget: {min: number, max: number} if mentioned, null otherwise
        - urgency: "low" (flexible timeline), "medium" (standard), or "high" (urgent/ASAP)
        - complexity: "simple", "medium", or "complex" based on requirements described
        - skills: array of technical skills mentioned or implied
        
        Be precise and only extract what's clearly mentioned or strongly implied.
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })

      const content = response.choices[0].message.content
      if (!content) {
        throw new Error('No content returned from OpenAI')
      }

      const intent = JSON.parse(content) as IAISearchIntent
      log.info('Search intent extracted successfully', { query, intent })
      
      return intent
    } catch (error) {
      log.error('Error extracting search intent:', error)
      throw error
    }
  }

  private extractFallbackIntent(query: string): IAISearchIntent {
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2)
    
    // Simple category detection based on keywords
    let category = 'General'
    if (keywords.some(k => ['logo', 'design', 'graphic', 'branding'].includes(k))) {
      category = 'Graphics & Design'
    } else if (keywords.some(k => ['website', 'web', 'app', 'development'].includes(k))) {
      category = 'Programming & Tech'
    } else if (keywords.some(k => ['writing', 'content', 'article', 'blog'].includes(k))) {
      category = 'Writing & Translation'
    } else if (keywords.some(k => ['video', 'animation', 'editing'].includes(k))) {
      category = 'Video & Animation'
    } else if (keywords.some(k => ['marketing', 'seo', 'social'].includes(k))) {
      category = 'Digital Marketing'
    }

    // Simple urgency detection
    let urgency: 'low' | 'medium' | 'high' = 'medium'
    if (keywords.some(k => ['urgent', 'asap', 'rush', 'quickly'].includes(k))) {
      urgency = 'high'
    } else if (keywords.some(k => ['flexible', 'whenever'].includes(k))) {
      urgency = 'low'
    }

    return {
      category,
      keywords,
      mainKeywords: keywords,
      urgency,
      complexity: 'medium',
      skills: []
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Force OpenAI usage - no fallback allowed
    if (config.USE_OPENAI !== 'true' || !this.openai) {
      throw new Error('OpenAI is required but not properly configured. Please check OPENAI_API_KEY and USE_OPENAI settings.')
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text.replace(/\n/g, ' ')
      })

      return response.data[0].embedding
    } catch (error) {
      log.error('Error generating embedding:', error)
      throw error
    }
  }

  private generateMockEmbedding(text: string): number[] {
    // Create deterministic mock embedding based on text content
    const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const random = () => {
      const x = Math.sin(seed) * 10000
      return (x - Math.floor(x)) * 0.2 - 0.1 // Range: -0.1 to 0.1
    }
    
    return Array.from({length: 1536}, () => random())
  }

  async generateMultipleEmbeddings(texts: string[]): Promise<number[][]> {
    // Force OpenAI usage - no fallback allowed
    if (config.USE_OPENAI !== 'true' || !this.openai) {
      throw new Error('OpenAI is required but not properly configured. Please check OPENAI_API_KEY and USE_OPENAI settings.')
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: texts.map(text => text.replace(/\n/g, ' '))
      })

      return response.data.map(item => item.embedding)
    } catch (error) {
      log.error('Error generating multiple embeddings:', error)
      throw error
    }
  }

  async generateGigExplanation(
    gigTitle: string,
    gigDescription: string,
    userQuery: string,
    similarity: number,
    reasons: string[]
  ): Promise<string> {
    // Force OpenAI usage - no fallback allowed
    if (config.USE_OPENAI !== 'true' || !this.openai) {
      throw new Error('OpenAI is required but not properly configured. Please check OPENAI_API_KEY and USE_OPENAI settings.')
    }

    try {
      const prompt = `
        Generate a brief, helpful explanation for why this gig matches the user's request:
        
        User Query: "${userQuery}"
        Gig Title: "${gigTitle}"
        Gig Description: "${gigDescription.substring(0, 200)}..."
        Match Score: ${similarity.toFixed(2)}
        Reasons: ${reasons.join(', ')}
        
        Write a concise explanation (1-2 sentences) that explains why this gig is recommended.
        Focus on the most relevant matching aspects.
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 100
      })

      const content = response.choices[0].message.content
      if (!content) {
        throw new Error('No explanation content returned from OpenAI')
      }
      return content
    } catch (error) {
      log.error('Error generating explanation:', error)
      throw error
    }
  }

  private generateFallbackExplanation(gigTitle: string, userQuery: string, reasons: string[], similarity: number): string {
    const score = Math.round(similarity * 100)
    const mainReason = reasons.length > 0 ? reasons[0] : 'matching requirements'
    return `This gig "${gigTitle}" is a ${score}% match for your request because of ${mainReason}.`
  }

  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length')
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}

export const openAIService = new OpenAIService()