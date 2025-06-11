import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { AnalysisResults } from "./AnalysisResults";

export function CarbonAnalyzer() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  
  const analyzeWebsite = useAction(api.carbonAnalysis.analyzeWebsite);

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
            <p>We use the official Website Carbon API to analyze your website's real environmental impact, including CO₂ emissions, energy consumption, and green hosting status.</p>
          </div>
        </form>
      </div>

      {/* Current Analysis Results */}
      {currentAnalysis && (
        <AnalysisResults analysis={currentAnalysis} />
      )}
    </div>
  );
}
