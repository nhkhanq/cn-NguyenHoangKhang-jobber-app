import { FC, useState, useCallback, useEffect } from 'react';
import { FaRobot, FaSearch, FaSpinner } from 'react-icons/fa';
import { useGetAIRecommendationsMutation, useGetAISearchSuggestionsQuery } from '../services/ai-recommendation.service';
import { IAIRecommendationRequest, IAIRecommendationResponse } from '../interfaces/ai-recommendation.interface';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';

interface IAISearchBoxProps {
  onRecommendations?: (recommendations: IAIRecommendationResponse) => void;
  placeholder?: string;
  showBudgetFilter?: boolean;
  className?: string;
}

const AISearchBox: FC<IAISearchBoxProps> = ({
  onRecommendations,
  placeholder = 'Describe what you need... (e.g., I need a modern website for my restaurant)',
  showBudgetFilter = true,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState<number | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const authUser = useAppSelector((state: IReduxState) => state.authUser);

  const [getRecommendations, { isLoading: isSearching }] = useGetAIRecommendationsMutation();
  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useGetAISearchSuggestionsQuery(query, { skip: query.length < 3 });

  const handleSearch = useCallback(async () => {
    if (!query.trim() || isSearching) return;

    try {
      const request: IAIRecommendationRequest = {
        query: query.trim(),
        budget,
        userId: authUser.id?.toString()
      };

      const result = await getRecommendations(request).unwrap();

      if (result && onRecommendations) {
        const response = (result as any)?.data || result;
        onRecommendations(response as IAIRecommendationResponse);
      }

      setShowSuggestions(false);
    } catch (error) {
      console.error('AI recommendation error:', error);
    }
  }, [query, budget, authUser.id, getRecommendations, onRecommendations, isSearching]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const suggestions: string[] = []; // TODO: implement suggestions when backend is ready

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Main Search Box */}
      <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center p-4">
          <div className="flex items-center space-x-3 flex-1">
            <FaRobot className="text-blue-500 text-xl flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsExpanded(true)}
              placeholder={placeholder}
              className="w-full text-lg placeholder-gray-500 outline-none bg-transparent"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="ml-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            {isSearching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
            <span>{isSearching ? 'Searching...' : 'Search'}</span>
          </button>
        </div>

        {/* Budget Filter */}
        {showBudgetFilter && isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 mt-3">
              <label className="text-sm font-medium text-gray-700">Budget:</label>
              <select
                value={budget || ''}
                onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : undefined)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="">Any budget</option>
                <option value="50">Under $50</option>
                <option value="100">Under $100</option>
                <option value="250">Under $250</option>
                <option value="500">Under $500</option>
                <option value="1000">Under $1,000</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
          {isLoadingSuggestions ? (
            <div className="p-4 text-center text-gray-500">
              <FaSpinner className="animate-spin inline mr-2" />
              Loading suggestions...
            </div>
          ) : (
            suggestions.map((suggestion: string, index: number) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
              >
                <div className="flex items-center space-x-3">
                  <FaSearch className="text-gray-400 text-sm" />
                  <span className="text-gray-700">{suggestion}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* AI Hint */}
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-500">
          <FaRobot className="inline mr-1" />
          Powered by AI - Describe your project naturally for smarter recommendations
        </p>
      </div>
    </div>
  );
};

export default AISearchBox;
