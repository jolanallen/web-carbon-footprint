import React, { useState, useEffect } from 'react';
import { Leaf, Globe, Droplet, Zap, TrendingDown, Award, Share2, Info } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


const EcoWebAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Simulated byte values for different website types
  const siteProfiles = {
    'simple': { bytes: 500000, green: 1 },
    'medium': { bytes: 2000000, green: 0 },
    'heavy': { bytes: 5000000, green: 0 },
    'optimized': { bytes: 800000, green: 1 }
  };

  const analyzeWebsite = async () => {
    setLoading(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo: randomly select a profile or use URL characteristics
    const profiles = Object.keys(siteProfiles);
    const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
    const { bytes, green } = siteProfiles[randomProfile];
    
    try {
      // Call WebsiteCarbon API
      const response = await fetch(`https://api.websitecarbon.com/data?bytes=${bytes}&green=${green}`);
      const data = await response.json();
      
      // Generate AI insights (simulated for demo)
      const aiInsights = generateAIInsights(data, bytes, green);
      
      setResults({
        ...data,
        bytes,
        green,
        url,
        aiInsights,
        suggestions: generateSuggestions(bytes, green, data)
      });
    } catch (error) {
      console.error('Error analyzing website:', error);
      // Fallback with simulated data
      const simulatedData = {
        co2: bytes * 0.0000004,
        energy: bytes * 0.0000001,
        cleaner: Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 50),
        bytes,
        green,
        url
      };
      
      setResults({
        ...simulatedData,
        aiInsights: generateAIInsights(simulatedData, bytes, green),
        suggestions: generateSuggestions(bytes, green, simulatedData)
      });
    }
    
    setLoading(false);
  };

  const generateAIInsights = (data, bytes, green) => {
    const co2InGrams = (data.co2 * 1000).toFixed(2);
    const cleanerPercentage = data.cleaner || 50;
    
    // Environmental equivalents
    const smsEquivalent = Math.round(co2InGrams / 0.014);
    const kmDriving = (co2InGrams / 120).toFixed(2);
    const teaCups = Math.round(co2InGrams / 21);
    
    return {
      summary: `Your website consumes ${co2InGrams}g of CO₂ per visit, equivalent to sending ${smsEquivalent} SMS messages or driving ${kmDriving}km. It is ${cleanerPercentage > 50 ? 'cleaner' : 'more polluting'} than ${cleanerPercentage}% of measured websites.`,
      
      impact: {
        level: cleanerPercentage > 70 ? 'Low' : cleanerPercentage > 40 ? 'Medium' : 'High',
        description: cleanerPercentage > 70 
          ? 'Great job! Your website has a relatively low environmental impact.'
          : cleanerPercentage > 40
          ? 'Your website has moderate environmental impact with room for improvement.'
          : 'Your website has significant environmental impact. Consider implementing our suggestions.',
        
        yearlyImpact: {
          co2: (co2InGrams * 10000 / 1000).toFixed(1), // kg for 10k visits/year
          energy: (data.energy * 10000).toFixed(1), // kWh
          water: (data.energy * 10000 * 1.8).toFixed(1) // liters (1.8L per kWh)
        }
      },
      
      comparisons: [
        { icon: '✉️', value: smsEquivalent, unit: 'SMS messages' },
        { icon: '🚗', value: kmDriving, unit: 'km driven' },
        { icon: '☕', value: teaCups, unit: 'cups of tea' }
      ],
      
      grade: cleanerPercentage > 80 ? 'A' : cleanerPercentage > 60 ? 'B' : cleanerPercentage > 40 ? 'C' : cleanerPercentage > 20 ? 'D' : 'F'
    };
  };

  const generateSuggestions = (bytes, green, data) => {
    const suggestions = [];
    
    if (bytes > 3000000) {
      suggestions.push({
        priority: 'high',
        title: 'Optimize Images',
        description: 'Compress and resize images. Consider using WebP format.',
        impact: '30-50% reduction in page weight',
        icon: '🖼️'
      });
    }
    
    if (bytes > 2000000) {
      suggestions.push({
        priority: 'high',
        title: 'Minify Resources',
        description: 'Minify CSS, JavaScript, and HTML files.',
        impact: '10-20% reduction in file sizes',
        icon: '📦'
      });
    }
    
    if (!green) {
      suggestions.push({
        priority: 'high',
        title: 'Switch to Green Hosting',
        description: 'Migrate to a hosting provider powered by renewable energy.',
        impact: '100% reduction in carbon emissions',
        icon: '🌱'
      });
    }
    
    suggestions.push({
      priority: 'medium',
      title: 'Implement Lazy Loading',
      description: 'Load images and content only when needed.',
      impact: '20-30% improvement in initial load',
      icon: '⚡'
    });
    
    if (bytes > 1500000) {
      suggestions.push({
        priority: 'medium',
        title: 'Use a CDN',
        description: 'Distribute content globally to reduce server load.',
        impact: '15-25% reduction in energy use',
        icon: '🌐'
      });
    }
    
    suggestions.push({
      priority: 'low',
      title: 'Remove Unused Code',
      description: 'Audit and remove unused CSS, JavaScript, and fonts.',
      impact: '5-15% reduction in page weight',
      icon: '🧹'
    });
    
    return suggestions;
  };

  const getGradeColor = (grade) => {
    const colors = { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#ef4444', F: '#991b1b' };
    return colors[grade] || '#6b7280';
  };

  const ShareBadge = () => {
    if (!results || !results.aiInsights) return null;
    
    const shareText = `🌍 My website scores ${results.aiInsights.grade} for environmental impact! It's cleaner than ${results.cleaner}% of websites tested. Check your site's eco-score!`;
    
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Share Your Eco-Score</h3>
            <p className="text-gray-600">Proud of your score? Share it on social media!</p>
          </div>
          <button
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">Eco Web Analyzer</h1>
          </div>
          <p className="text-lg text-gray-600">Measure and reduce your website's environmental impact with AI-powered insights</p>
        </header>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g., https://example.com)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={analyzeWebsite}
              disabled={!url || loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5" />
                  Analyze
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            <Info className="w-4 h-4 inline mr-1" />
            Demo mode: Using simulated data for demonstration purposes
          </p>
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <Leaf className="w-8 h-8 text-green-600" />
                  <span className={`text-3xl font-bold`} style={{ color: getGradeColor(results.aiInsights.grade) }}>
                    {results.aiInsights.grade}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm">Eco Grade</h3>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-8 h-8 text-yellow-600" />
                  <span className="text-2xl font-bold">{(results.co2 * 1000).toFixed(2)}g</span>
                </div>
                <h3 className="text-gray-600 text-sm">CO₂ per visit</h3>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <Droplet className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl font-bold">{results.cleaner}%</span>
                </div>
                <h3 className="text-gray-600 text-sm">Cleaner than</h3>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingDown className="w-8 h-8 text-purple-600" />
                  <span className="text-2xl font-bold">{results.aiInsights.impact.level}</span>
                </div>
                <h3 className="text-gray-600 text-sm">Impact Level</h3>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-green-600" />
                AI Environmental Analysis
              </h2>
              <p className="text-gray-700 mb-4">{results.aiInsights.summary}</p>
              <p className="text-gray-600">{results.aiInsights.impact.description}</p>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                {results.aiInsights.comparisons.map((comp, idx) => (
                  <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-2">{comp.icon}</div>
                    <div className="text-xl font-bold">{comp.value}</div>
                    <div className="text-sm text-gray-600">{comp.unit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex border-b">
                {['overview', 'suggestions', 'visualizations'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-3 font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Yearly Environmental Impact (10,000 visits)</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-700">{results.aiInsights.impact.yearlyImpact.co2} kg</div>
                          <div className="text-sm text-gray-600">CO₂ Emissions</div>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-700">{results.aiInsights.impact.yearlyImpact.energy} kWh</div>
                          <div className="text-sm text-gray-600">Energy Consumption</div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-700">{results.aiInsights.impact.yearlyImpact.water} L</div>
                          <div className="text-sm text-gray-600">Water Usage</div>
                        </div>
                      </div>
                    </div>
                    
                    <ShareBadge />
                  </div>
                )}

                {activeTab === 'suggestions' && (
                  <div className="space-y-4">
                    {results.suggestions.map((suggestion, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${
                        suggestion.priority === 'high' ? 'border-red-200 bg-red-50' :
                        suggestion.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                        'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{suggestion.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{suggestion.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{suggestion.description}</p>
                            <p className="text-sm font-medium mt-2 text-green-700">
                              Expected impact: {suggestion.impact}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            suggestion.priority === 'high' ? 'bg-red-200 text-red-800' :
                            suggestion.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-gray-200 text-gray-800'
                          }`}>
                            {suggestion.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'visualizations' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Performance Distribution</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                          { name: 'Your Site', value: results.cleaner },
                          { name: 'Average', value: 50 },
                          { name: 'Target', value: 80 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Resource Breakdown</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Images', value: 40, color: '#f59e0b' },
                              { name: 'Scripts', value: 30, color: '#3b82f6' },
                              { name: 'Styles', value: 20, color: '#10b981' },
                              { name: 'Other', value: 10, color: '#8b5cf6' }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({name, value}) => `${name}: ${value}%`}
                          >
                            {[0,1,2,3].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'][index]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EcoWebAnalyzer;
