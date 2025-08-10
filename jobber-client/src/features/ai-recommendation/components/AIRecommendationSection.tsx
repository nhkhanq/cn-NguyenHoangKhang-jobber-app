import { FC, useState } from 'react';
import { FaRobot, FaChevronRight, FaStar } from 'react-icons/fa';
import { IAIRecommendationResponse } from '../interfaces/ai-recommendation.interface';
import AISearchBox from './AISearchBox';
import AIRecommendationCard from './AIRecommendationCard';

interface IAIRecommendationSectionProps {
  title?: string;
  subtitle?: string;
  maxResults?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  className?: string;
}

const AIRecommendationSection: FC<IAIRecommendationSectionProps> = ({
  title = 'Discover with AI',
  subtitle = 'Tell us what you need, and our AI will find the perfect match',
  maxResults = 3,
  showViewAll = true,
  onViewAll,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState<IAIRecommendationResponse | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRecommendations = (newRecommendations: IAIRecommendationResponse) => {
    setRecommendations(newRecommendations);
    setIsExpanded(true);
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      // Navigate to dedicated AI recommendations page
      window.location.href = '/ai-recommendations';
    }
  };

  const displayedMatches = recommendations?.matches.slice(0, maxResults) || [];

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full mr-3">
              <FaRobot className="text-xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* AI Search Box */}
        <div className="max-w-4xl mx-auto mb-8">
          <AISearchBox
            onRecommendations={handleRecommendations}
            placeholder="What kind of service do you need? Describe it naturally..."
            showBudgetFilter={false}
          />
        </div>

        {/* Quick Example Queries */}
        {!isExpanded && (
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 mb-3">Try asking:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'I need a modern logo for my tech startup',
                'Build a restaurant website with online ordering',
                'Create promotional videos for social media',
                'Design a mobile app for my business'
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // You could auto-fill the search box with this example
                    console.log('Example clicked:', example);
                  }}
                  className="bg-white border border-gray-300 hover:border-blue-400 text-gray-700 text-sm px-4 py-2 rounded-full transition-all duration-200 hover:shadow-md"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations Results */}
        {recommendations && displayedMatches.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <FaStar className="text-yellow-500" />
                <h3 className="text-xl font-semibold text-gray-900">AI Recommendations</h3>
                <span className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-full">{recommendations.totalFound} found</span>
              </div>

              {showViewAll && recommendations.totalFound > maxResults && (
                <button
                  onClick={handleViewAll}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <span>View all {recommendations.totalFound}</span>
                  <FaChevronRight className="text-sm" />
                </button>
              )}
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedMatches.map((match) => (
                <AIRecommendationCard key={match.gigId} match={match} recommendationId={`home-${Date.now()}-${match.gigId}`} />
              ))}
            </div>

            {/* Performance Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                <FaRobot className="inline mr-1" />
                Results generated in {recommendations.processingTime}ms using AI semantic matching
              </p>
            </div>
          </div>
        )}

        {/* Empty State for Home */}
        {!isExpanded && (
          <div className="text-center py-8">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 text-4xl mb-4">🤖✨</div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">Ready to find your perfect freelancer?</h4>
              <p className="text-gray-500">
                Our AI understands natural language. Just describe what you need, and we'll match you with the best talent.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AIRecommendationSection;
