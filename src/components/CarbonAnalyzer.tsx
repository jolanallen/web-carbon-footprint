import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { AnalysisResults } from "./AnalysisResults";

export function CarbonAnalyzer() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  
  const analyzeWebsite = useAction(api.carbonAnalysis.analyzeWebsite);
  const userAnalyses = useQuery(api.carbonAnalysis.getUserAnalyses);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      const result = await analyzeWebsite({ url: normalizedUrl });
      setCurrentAnalysis(result);
      toast.success("Analysis complete! 🌱");
      setUrl("");
    } catch (error) {
      console.error("Analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Analyzer Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-200">
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-lg font-semibold text-green-800 mb-3">
              Enter Website URL to Analyze
            </label>
            <div className="flex gap-3">
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com or https://example.com"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all text-lg"
                disabled={isAnalyzing}
              />
              <button
                type="submit"
                disabled={isAnalyzing || !url.trim()}
                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </div>
                ) : (
                  "🔍 Analyze"
                )}
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg">
            <p className="font-medium text-green-800 mb-1">💡 How it works:</p>
            <p>We estimate your website's data transfer, check for green hosting, and calculate environmental impact using the WebsiteCarbon API.</p>
          </div>
        </form>
      </div>

      {/* Current Analysis Results */}
      {currentAnalysis && (
        <AnalysisResults analysis={currentAnalysis} />
      )}

      {/* Previous Analyses */}
      {userAnalyses && userAnalyses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
          <h3 className="text-2xl font-bold text-green-800 mb-6">Your Recent Analyses</h3>
          <div className="grid gap-4">
            {userAnalyses.slice(0, 3).map((analysis) => (
              <div
                key={analysis._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setCurrentAnalysis(analysis as any)}
              >
                <div>
                  <p className="font-medium text-gray-800">{analysis.url}</p>
                  <p className="text-sm text-gray-600">
                    {analysis.co2}g CO₂ • Grade {analysis.ecoScore}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    analysis.ecoScore === 'A' ? 'bg-green-100 text-green-800' :
                    analysis.ecoScore === 'B' ? 'bg-blue-100 text-blue-800' :
                    analysis.ecoScore === 'C' ? 'bg-yellow-100 text-yellow-800' :
                    analysis.ecoScore === 'D' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {analysis.ecoScore}
                  </span>
                  <span className="text-gray-400">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
