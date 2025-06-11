import { useState } from "react";

interface Analysis {
  url: string;
  bytes: number;
  green: boolean;
  co2: number;
  energy: number;
  cleanerThan: number;
  aiSummary: string;
  suggestions: string[];
  ecoScore: string;
}

interface AnalysisResultsProps {
  analysis: Analysis;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'share'>('overview');

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'E': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreMessage = (score: string) => {
    switch (score) {
      case 'A': return 'Excellent! Your website is very eco-friendly 🌟';
      case 'B': return 'Good job! Your website is quite sustainable 👍';
      case 'C': return 'Not bad, but there\'s room for improvement 📈';
      case 'D': return 'Your website could be more eco-friendly 🔄';
      case 'E': return 'Significant improvements needed for sustainability ⚠️';
      default: return '';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const generateShareText = () => {
    return `I just analyzed my website's environmental impact with EcoWeb Analyzer! 🌱

🌐 Website: ${analysis.url}
📊 Eco Score: ${analysis.ecoScore}
🌍 CO₂ per visit: ${analysis.co2}g
⚡ Energy: ${analysis.energy} Wh
🏆 Cleaner than ${analysis.cleanerThan}% of websites

Making the web more sustainable! #EcoWeb #Sustainability #GreenTech`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-green-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Analysis Results</h2>
            <p className="text-green-100">{analysis.url}</p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold ${getScoreColor(analysis.ecoScore)} text-green-800 bg-white`}>
              {analysis.ecoScore}
            </div>
            <p className="text-sm mt-2 text-green-100">Eco Score</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'suggestions', label: '💡 Suggestions', icon: '💡' },
            { id: 'share', label: '🚀 Share', icon: '🚀' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-green-500 text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Score Message */}
            <div className={`p-4 rounded-lg ${getScoreColor(analysis.ecoScore)}`}>
              <p className="font-medium">{getScoreMessage(analysis.ecoScore)}</p>
            </div>

            {/* AI Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">🤖 AI Analysis</h3>
              <p className="text-blue-700">{analysis.aiSummary}</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{analysis.co2}g</div>
                <div className="text-sm text-red-700">CO₂ per visit</div>
                <div className="text-xs text-red-600 mt-1">
                  ≈ {Math.round(analysis.co2 * 20)} SMS messages
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{analysis.energy} Wh</div>
                <div className="text-sm text-yellow-700">Energy consumed</div>
                <div className="text-xs text-yellow-600 mt-1">
                  ≈ {(analysis.energy * 60).toFixed(1)} seconds of LED bulb
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{formatBytes(analysis.bytes)}</div>
                <div className="text-sm text-blue-700">Data transferred</div>
                <div className="text-xs text-blue-600 mt-1">
                  Page weight
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{analysis.cleanerThan}%</div>
                <div className="text-sm text-green-700">Cleaner than</div>
                <div className="text-xs text-green-600 mt-1">
                  Of tested websites
                </div>
              </div>
            </div>

            {/* Green Hosting Status */}
            <div className={`p-4 rounded-lg ${analysis.green ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{analysis.green ? '🌱' : '⚠️'}</span>
                <div>
                  <p className={`font-medium ${analysis.green ? 'text-green-800' : 'text-orange-800'}`}>
                    {analysis.green ? 'Green Hosting Detected' : 'Standard Hosting'}
                  </p>
                  <p className={`text-sm ${analysis.green ? 'text-green-600' : 'text-orange-600'}`}>
                    {analysis.green 
                      ? 'This website is hosted on renewable energy! 🎉'
                      : 'Consider switching to a green hosting provider to reduce impact'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-green-800 mb-4">💡 Personalized Recommendations</h3>
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-green-600 font-bold text-lg">{index + 1}.</span>
                  <p className="text-gray-700 flex-1">{suggestion}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Quick Wins</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Compress images (can reduce size by 60-80%)</li>
                <li>• Enable gzip compression on your server</li>
                <li>• Remove unused CSS and JavaScript</li>
                <li>• Use a Content Delivery Network (CDN)</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'share' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">🚀 Share Your Results</h3>
            
            {/* Eco Badge */}
            <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-6 text-white text-center">
              <div className="text-4xl mb-2">🌱</div>
              <div className="text-2xl font-bold">Eco Score: {analysis.ecoScore}</div>
              <div className="text-green-100">Website Carbon Analysis</div>
              <div className="text-sm mt-2 opacity-90">{analysis.url}</div>
            </div>

            {/* Share Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share on social media:
              </label>
              <textarea
                value={generateShareText()}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg text-sm h-32 resize-none"
                onClick={(e) => e.currentTarget.select()}
              />
              <p className="text-xs text-gray-500 mt-1">Click to select all text</p>
            </div>

            {/* Share Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateShareText());
                  // You could add a toast notification here
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                📋 Copy Text
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(generateShareText())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center"
              >
                🐦 Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(analysis.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-center"
              >
                💼 LinkedIn
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
