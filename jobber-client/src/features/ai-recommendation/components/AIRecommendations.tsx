import { FC, useState } from 'react';
import { FaRobot, FaStar, FaHistory, FaTimes } from 'react-icons/fa';
import { useGetRecommendationHistoryQuery } from '../services/ai-recommendation.service';
import { IAIRecommendationResponse, IAIGigMatch } from '../interfaces/ai-recommendation.interface';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import AISearchBox from './AISearchBox';
import AIRecommendationCard from './AIRecommendationCard';

interface IAIRecommendationsProps {
  initialQuery?: string;
  showHistory?: boolean;
  className?: string;
}

const AIRecommendations: FC<IAIRecommendationsProps> = ({ initialQuery = '', showHistory = true, className = '' }) => {
  const [recommendations, setRecommendations] = useState<IAIRecommendationResponse | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const authUser = useAppSelector((state: IReduxState) => state.authUser);

  const { data: historyData } = useGetRecommendationHistoryQuery(
    { userId: authUser.id?.toString() || '', limit: 10 },
    { skip: !authUser.id || !showHistory }
  );

  const handleRecommendations = (newRecommendations: IAIRecommendationResponse) => {
    setRecommendations(newRecommendations);
    setSearchPerformed(true);
  };

  // Render AI recommendation card directly with match data
  const renderRecommendationCard = (match: IAIGigMatch, index: number) => {
    return <AIRecommendationCard key={match.gigId} match={match} recommendationId={`${Date.now()}-${match.gigId}-${index}`} />;
  };

  const renderSearchSection = () => (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 mb-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full mb-4">
          <FaRobot className="text-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Gig Discovery</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Describe your project naturally, and our AI will find the perfect freelancers for you
        </p>
      </div>

      <AISearchBox
        onRecommendations={handleRecommendations}
        placeholder={initialQuery || 'Describe what you need... (e.g., I need a modern website for my restaurant)'}
        showBudgetFilter={true}
        className="mb-4"
      />

      <div className="flex justify-center space-x-4 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <FaStar className="text-yellow-500" />
          <span>Smart matching</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>•</span>
          <span>Natural language</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>•</span>
          <span>Instant results</span>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!searchPerformed) return null;

    if (!recommendations || recommendations.matches.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches found</h3>
          <p className="text-gray-500 mb-4">Try refining your search with different keywords or broader terms</p>
          {recommendations?.suggestions && recommendations.suggestions.length > 0 && (
            <div className="max-w-md mx-auto">
              <p className="text-sm text-gray-600 mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {recommendations.suggestions.map((suggestion, index) => (
                  <span key={index} className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">AI Recommendations</h3>
            <p className="text-gray-600 mt-1">
              Found {recommendations.totalFound} matches in {recommendations.processingTime}ms
            </p>
          </div>

          {showHistory && (
            <button
              onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <FaHistory />
              <span>History</span>
            </button>
          )}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.matches.map((match, index) => renderRecommendationCard(match, index))}
        </div>

        {/* Performance Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <FaRobot className="text-blue-500" />
              <span>Powered by AI</span>
            </div>
            <span>•</span>
            <span>{recommendations.totalFound} gigs analyzed</span>
            <span>•</span>
            <span>Response time: {recommendations.processingTime}ms</span>
          </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    if (!showHistoryPanel || !historyData) return null;

    // Mock history data since backend not implemented yet
    const history: any[] = [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Search History</h3>
            <button onClick={() => setShowHistoryPanel(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <FaTimes />
            </button>
          </div>

          <div className="overflow-y-auto max-h-96">
            {history.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FaHistory className="text-4xl mb-2 mx-auto" />
                <p>No search history yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {history.map((item: any, index: number) => (
                  <div key={index} className="p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium text-gray-900 mb-1">"{item.query}"</div>
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(item.timestamp).toLocaleDateString()} • {item.results.length} results
                    </div>
                    {item.feedback && <div className="text-xs text-blue-600">Rated {item.feedback.rating}/5</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {renderSearchSection()}
      {renderResults()}
      {renderHistory()}
    </div>
  );
};

export default AIRecommendations;
