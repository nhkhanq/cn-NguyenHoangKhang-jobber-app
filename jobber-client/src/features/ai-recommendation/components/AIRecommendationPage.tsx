import { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import AIRecommendations from './AIRecommendations';

const AIRecommendationPage: FC = () => {
  return (
    <>
      <Helmet>
        <title>AI-Powered Gig Recommendations | Jobber</title>
        <meta
          name="description"
          content="Find the perfect freelancer using AI. Describe your project naturally and get smart recommendations based on semantic matching."
        />
        <meta name="keywords" content="AI recommendations, freelancer search, smart matching, gig discovery" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <AIRecommendations showHistory={true} className="max-w-7xl mx-auto" />
        </div>
      </div>
    </>
  );
};

export default AIRecommendationPage;
