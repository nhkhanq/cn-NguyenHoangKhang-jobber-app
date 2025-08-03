import { Document, model, Schema } from 'mongoose';
import { IGigSimilarity, IRecommendationHistory } from '@ai/interfaces/recommendation.interface';

const gigSimilaritySchema: Schema = new Schema(
  {
    gigId: { type: String, required: true, unique: true, index: true },
    embedding: { type: [Number], required: true },
    lastUpdated: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

const recommendationHistorySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    query: { type: String, required: true },
    recommendations: [
      {
        gigId: String,
        title: String,
        description: String,
        basicTitle: String,
        basicDescription: String,
        username: String,
        profilePicture: String,
        price: Number,
        similarity: Number,
        explanation: String,
        confidence: Number,
        categories: [String],
        tags: [String]
      }
    ],
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String
    }
  },
  {
    timestamps: true
  }
);

export const GigSimilarityModel = model<IGigSimilarity & Document>('GigSimilarity', gigSimilaritySchema);
export const RecommendationHistoryModel = model<IRecommendationHistory & Document>('RecommendationHistory', recommendationHistorySchema);