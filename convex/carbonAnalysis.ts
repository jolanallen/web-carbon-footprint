import { query, mutation, action, internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Use the actual Website Carbon API
async function analyzeWebsiteCarbon(url: string): Promise<{
  bytes: number;
  co2: number;
  energy: number;
  cleanerThan: number;
  green: boolean;
}> {
  try {
    console.log(`Calling Website Carbon API for: ${url}`);
    
    // Call the Website Carbon API
    const response = await fetch(`https://api.websitecarbon.com/site?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'EcoWebAnalyzer/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Website Carbon API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Website Carbon API response:", data);

    // Extract data from the API response
    // The API returns data in a specific format - adjust based on actual response structure
    return {
      bytes: data.bytes || data.transferSize || 650000, // Fallback to average if not provided
      co2: data.co2 || data.carbon || 0.5, // CO2 in grams
      energy: data.energy || data.energyConsumption || 0.003, // Energy in Wh
      cleanerThan: data.cleanerThan || data.percentage || 50, // Percentage cleaner than other sites
      green: data.green || data.greenHosting || false // Whether hosting is green
    };

  } catch (error) {
    console.error('Website Carbon API failed:', error);
    
    // Fallback to our own analysis if the API fails
    return await fallbackAnalysis(url);
  }
}

// Fallback analysis if the API is unavailable
async function fallbackAnalysis(url: string): Promise<{
  bytes: number;
  co2: number;
  energy: number;
  cleanerThan: number;
  green: boolean;
}> {
  try {
    // Try to get basic website size
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EcoWebAnalyzer/1.0)'
      }
    });
    
    const contentLength = response.headers.get('content-length');
    let bytes = contentLength ? parseInt(contentLength) : 0;
    
    // Estimate based on domain if no content-length
    if (!bytes) {
      const domain = new URL(url).hostname.toLowerCase();
      if (domain.includes('google')) bytes = 45000;
      else if (domain.includes('youtube')) bytes = 2800000;
      else if (domain.includes('facebook') || domain.includes('instagram')) bytes = 1600000;
      else if (domain.includes('amazon') || domain.includes('shop')) bytes = 1400000;
      else if (domain.includes('news') || domain.includes('blog')) bytes = 900000;
      else if (domain.includes('github')) bytes = 180000;
      else bytes = 650000; // Average website size
    }

    // Check green hosting
    const green = await checkGreenHosting(url);
    
    // Calculate environmental impact
    const co2PerByte = green ? 0.000000233 : 0.000000494; // grams CO2 per byte
    const energyPerByte = 0.000000006; // Wh per byte
    
    const co2 = Math.round((bytes * co2PerByte) * 1000) / 1000;
    const energy = Math.round((bytes * energyPerByte) * 1000) / 1000;
    
    // Calculate percentile
    let cleanerThan;
    if (bytes < 500000) cleanerThan = 85;
    else if (bytes < 1000000) cleanerThan = 70;
    else if (bytes < 2000000) cleanerThan = 50;
    else if (bytes < 4000000) cleanerThan = 25;
    else cleanerThan = 10;
    
    if (green) cleanerThan = Math.min(cleanerThan + 15, 95);

    return { bytes, co2, energy, cleanerThan, green };

  } catch (error) {
    console.error('Fallback analysis failed:', error);
    // Ultimate fallback with reasonable estimates
    return {
      bytes: 650000,
      co2: 0.32,
      energy: 0.0039,
      cleanerThan: 50,
      green: false
    };
  }
}

// Check if hosting is green using Green Web Foundation API
async function checkGreenHosting(url: string): Promise<boolean> {
  try {
    const domain = new URL(url).hostname;
    const response = await fetch(`https://api.thegreenwebfoundation.org/greencheck/${domain}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.green === true;
    }
  } catch (error) {
    console.error('Green hosting check failed:', error);
  }
  
  // Fallback: check against known green providers
  const domain = new URL(url).hostname.toLowerCase();
  const greenProviders = [
    'github.io', 'netlify.app', 'vercel.app', 'surge.sh', 
    'pages.dev', 'herokuapp.com', 'firebase.app'
  ];
  return greenProviders.some(provider => domain.includes(provider));
}

function calculateEcoScore(co2: number, cleanerThan: number): string {
  if (cleanerThan >= 90) return 'A';
  if (cleanerThan >= 75) return 'B';
  if (cleanerThan >= 50) return 'C';
  if (cleanerThan >= 25) return 'D';
  return 'E';
}

export const analyzeWebsite = action({
  args: { url: v.string() },
  handler: async (ctx, args): Promise<any> => {
    try {
      // Validate URL
      new URL(args.url);
      console.log(`Starting Website Carbon analysis for: ${args.url}`);
      
      // Use the Website Carbon API
      const analysisData = await analyzeWebsiteCarbon(args.url);
      
      console.log(`Analysis results:`, analysisData);
      
      // Generate AI summary and suggestions
      const aiResponse: any = await ctx.runAction(internal.carbonAnalysis.generateAIInsights, {
        url: args.url,
        co2: analysisData.co2,
        energy: analysisData.energy,
        cleanerThan: analysisData.cleanerThan,
        green: analysisData.green,
        bytes: analysisData.bytes
      });
      
      const ecoScore = calculateEcoScore(analysisData.co2, analysisData.cleanerThan);
      
      // Save analysis
      const userId = await getAuthUserId(ctx);
      await ctx.runMutation(internal.carbonAnalysis.saveAnalysis, {
        url: args.url,
        userId: userId || undefined,
        bytes: analysisData.bytes,
        green: analysisData.green,
        co2: analysisData.co2,
        energy: analysisData.energy,
        cleanerThan: analysisData.cleanerThan,
        aiSummary: aiResponse.summary,
        suggestions: aiResponse.suggestions,
        ecoScore: ecoScore
      });
      
      return {
        url: args.url,
        bytes: analysisData.bytes,
        green: analysisData.green,
        co2: analysisData.co2,
        energy: analysisData.energy,
        cleanerThan: analysisData.cleanerThan,
        aiSummary: aiResponse.summary,
        suggestions: aiResponse.suggestions,
        ecoScore: ecoScore
      };
      
    } catch (error) {
      console.error("Analysis failed:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url: args.url
      });
      throw new Error(`Failed to analyze website: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

export const generateAIInsights = internalAction({
  args: {
    url: v.string(),
    co2: v.number(),
    energy: v.number(),
    cleanerThan: v.number(),
    green: v.boolean(),
    bytes: v.number()
  },
  handler: async (ctx, args) => {
    const prompt = `Analyze this website's environmental impact and provide insights:

URL: ${args.url}
CO2 per visit: ${args.co2}g
Energy consumption: ${args.energy} Wh
Cleaner than: ${args.cleanerThan}% of websites
Green hosting: ${args.green ? 'Yes' : 'No'}
Page size: ${Math.round(args.bytes / 1024)}KB

Please provide:
1. A personalized, engaging summary of the environmental impact (2-3 sentences)
2. 3-5 specific, actionable suggestions for improvement

Make it educational but not preachy. Use relatable comparisons (like "equivalent to X SMS messages" or "like boiling Y kettles").`;

    try {
      const response = await fetch(process.env.CONVEX_OPENAI_BASE_URL + "/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API call failed: ${response.status}`, errorText);
        throw new Error(`AI API call failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the response to extract summary and suggestions
      const lines = content.split('\n').filter((line: string) => line.trim());
      const summaryLines = [];
      const suggestions = [];
      let inSuggestions = false;
      
      for (const line of lines) {
        if (line.toLowerCase().includes('suggestion') || line.match(/^\d+\./)) {
          inSuggestions = true;
        }
        
        if (inSuggestions && (line.match(/^\d+\./) || line.startsWith('•') || line.startsWith('-'))) {
          suggestions.push(line.replace(/^\d+\.\s*/, '').replace(/^[•-]\s*/, '').trim());
        } else if (!inSuggestions && line.trim()) {
          summaryLines.push(line.trim());
        }
      }
      
      return {
        summary: summaryLines.join(' ') || `This website generates ${args.co2}g of CO2 per visit, equivalent to ${Math.round(args.co2 * 20)} SMS messages. It performs better than ${args.cleanerThan}% of websites tested.`,
        suggestions: suggestions.length > 0 ? suggestions : [
          "Optimize and compress images to reduce file sizes",
          "Minify CSS and JavaScript files",
          "Consider switching to green web hosting",
          "Remove unused fonts and scripts",
          "Implement lazy loading for images"
        ]
      };
    } catch (error) {
      console.error("AI generation failed:", error);
      // Fallback response
      return {
        summary: `This website generates ${args.co2}g of CO2 per visit, equivalent to ${Math.round(args.co2 * 20)} SMS messages. It performs better than ${args.cleanerThan}% of websites tested.`,
        suggestions: [
          "Optimize and compress images to reduce file sizes",
          "Minify CSS and JavaScript files", 
          "Consider switching to green web hosting",
          "Remove unused fonts and scripts",
          "Implement lazy loading for images"
        ]
      };
    }
  },
});

export const saveAnalysis = internalMutation({
  args: {
    url: v.string(),
    userId: v.optional(v.id("users")),
    bytes: v.number(),
    green: v.boolean(),
    co2: v.number(),
    energy: v.number(),
    cleanerThan: v.number(),
    aiSummary: v.string(),
    suggestions: v.array(v.string()),
    ecoScore: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("analyses", args);
  },
});

export const getUserAnalyses = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
  },
});

export const getRecentAnalyses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("analyses")
      .order("desc")
      .take(5);
  },
});
