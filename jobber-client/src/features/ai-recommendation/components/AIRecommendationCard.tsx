import { FC, useState } from 'react';
import { FaRobot, FaStar, FaThumbsUp, FaThumbsDown, FaExternalLinkAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { IAIGigMatch } from '../interfaces/ai-recommendation.interface';
import { useProvideFeedbackMutation } from '../services/ai-recommendation.service';

interface IAIRecommendationCardProps {
  match: IAIGigMatch;
  recommendationId?: string;
  onFeedback?: (helpful: boolean) => void;
}

const AIRecommendationCard: FC<IAIRecommendationCardProps> = ({ match, recommendationId, onFeedback }) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [provideFeedback] = useProvideFeedbackMutation();

  const handleFeedback = async (helpful: boolean) => {
    if (feedbackGiven || !recommendationId) return;

    try {
      await provideFeedback({
        recommendationId,
        helpful,
        rating: helpful ? 5 : 2
      }).unwrap();

      setFeedbackGiven(true);
      onFeedback?.(helpful);
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.9) return 'Excellent Match';
    if (similarity >= 0.8) return 'Very Good Match';
    if (similarity >= 0.7) return 'Good Match';
    return 'Relevant Match';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* AI Match Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 text-white p-2 rounded-lg">
              <FaRobot className="text-sm" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-blue-700">{getSimilarityLabel(match.similarity)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(match.confidence)}`}>
                  {Math.round(match.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{match.explanation}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">{Math.round(match.similarity * 100)}% match</div>
          </div>
        </div>
      </div>

      {/* Gig Content */}
      <div className="p-6">
        <div>
          {/* Gig Image */}
          {match.coverImage && (
            <div className="mb-4">
              <img
                src={match.coverImage}
                alt={match.title}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=No+Image';
                }}
              />
            </div>
          )}

          {/* Gig Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{match.title}</h3>

            <p className="text-gray-600 text-sm line-clamp-3">{match.basicDescription}</p>

            {/* Seller Info */}
            <div className="flex items-center space-x-3">
              <img
                src={match.profilePicture || '/default-avatar.png'}
                alt={match.username}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/32x32?text=Avatar';
                }}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{match.username}</p>
                <div className="flex items-center space-x-1">
                  <FaStar className="text-yellow-400 text-xs" />
                  <span className="text-xs text-gray-600">
                    {match.ratingSum && match.ratingsCount ? (match.ratingSum / match.ratingsCount).toFixed(1) : 'New'} (
                    {match.ratingsCount || 0})
                  </span>
                </div>
              </div>
            </div>

            {/* Price and Action */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-lg font-bold text-gray-900">From ${match.price}</div>
              <Link
                to={`/gig/${match.username.toLowerCase()}/${match.title.replace(/\s+/g, '-').toLowerCase()}/${match.sellerId}/${match.gigId}/view`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <span>View Gig</span>
                <FaExternalLinkAlt className="text-xs" />
              </Link>
            </div>
          </div>
        </div>

        {/* Match Reasons */}
        {match.reasons.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Why this matches:</h4>
            <div className="flex flex-wrap gap-2">
              {match.reasons.map((reason, index) => (
                <span key={index} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {recommendationId && !feedbackGiven && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Was this recommendation helpful?</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFeedback(true)}
                className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                <FaThumbsUp />
                <span>Yes</span>
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <FaThumbsDown />
                <span>No</span>
              </button>
            </div>
          </div>
        )}

        {feedbackGiven && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Thank you for your feedback!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendationCard;
