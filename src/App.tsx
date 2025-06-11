import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { CarbonAnalyzer } from "./components/CarbonAnalyzer";
import { RecentAnalyses } from "./components/RecentAnalyses";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-green-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🌱</span>
            </div>
            <h1 className="text-xl font-bold text-green-800">EcoWeb Analyzer</h1>
          </div>
          <Authenticated>
            <SignOutButton />
          </Authenticated>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Content />
      </main>
      
      <footer className="bg-green-800 text-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm opacity-90">
            🌍 Making the web more sustainable, one analysis at a time
          </p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h2 className="text-4xl md:text-5xl font-bold text-green-800 leading-tight">
          Discover Your Website's
          <span className="block text-green-600">Environmental Impact</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Analyze any website's carbon footprint and get AI-powered insights to make the web more sustainable
        </p>
      </div>

      {/* Main Analyzer */}
      <Authenticated>
        <CarbonAnalyzer />
      </Authenticated>

      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">Sign In to Start</h3>
              <p className="text-gray-600">
                Create an account to analyze websites and track your eco-impact
              </p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      {/* Recent Analyses */}
      <RecentAnalyses />

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Real-time Analysis</h3>
          <p className="text-gray-600">
            Get instant insights into CO₂ emissions, energy consumption, and environmental impact
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">AI-Powered Insights</h3>
          <p className="text-gray-600">
            Receive personalized recommendations and actionable tips to reduce your website's footprint
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🏆</span>
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Eco Scoring</h3>
          <p className="text-gray-600">
            Track your progress with our eco-rating system and earn badges for sustainable practices
          </p>
        </div>
      </div>
    </div>
  );
}
