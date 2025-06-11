import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function RecentAnalyses() {
  const recentAnalyses = useQuery(api.carbonAnalysis.getRecentAnalyses);

  if (!recentAnalyses || recentAnalyses.length === 0) {
    return null;
  }

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'E': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
      <h3 className="text-2xl font-bold text-green-800 mb-6">🌍 Recent Community Analyses</h3>
      <div className="grid gap-4">
        {recentAnalyses.map((analysis) => (
          <div
            key={analysis._id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-800 truncate">{analysis.url}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span>🌍 {analysis.co2}g CO₂</span>
                <span>⚡ {analysis.energy} Wh</span>
                <span>📊 Top {100 - analysis.cleanerThan}%</span>
                {analysis.green && <span className="text-green-600">🌱 Green</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(analysis.ecoScore)}`}>
                {analysis.ecoScore}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Join the community and analyze your website's environmental impact!
        </p>
      </div>
    </div>
  );
}
