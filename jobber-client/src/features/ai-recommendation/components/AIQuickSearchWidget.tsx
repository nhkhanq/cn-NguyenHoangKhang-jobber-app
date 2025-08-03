import { FC, useState } from 'react';
import { FaRobot, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface IAIQuickSearchWidgetProps {
  className?: string;
  placeholder?: string;
}

const AIQuickSearchWidget: FC<IAIQuickSearchWidgetProps> = ({ className = '', placeholder = 'Describe what you need...' }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) {
      // Navigate to AI recommendations page with query
      navigate(`/ai-recommendations?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-200">
        <FaRobot className="text-blue-500 mr-2 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 outline-none text-sm placeholder-gray-500"
        />
        <button
          onClick={handleSearch}
          disabled={!query.trim()}
          className="ml-2 p-1 text-gray-400 hover:text-blue-500 disabled:text-gray-300 transition-colors"
        >
          <FaSearch className="text-sm" />
        </button>
      </div>

      <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 text-center">
        <span className="bg-white px-2">AI-powered search</span>
      </div>
    </div>
  );
};

export default AIQuickSearchWidget;
