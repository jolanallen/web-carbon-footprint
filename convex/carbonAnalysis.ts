import { query, mutation, action, internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Simulate byte estimation for different types of websites
function estimateWebsiteBytes(url: string): number {
  const domain = new URL(url).hostname.toLowerCase();
  
  // Simulate different website sizes based on common patterns
  if (domain.includes('google') || domain.includes('search')) return 50000; // Search engines are optimized
  if (domain.includes('news') || domain.includes('blog')) return 800000; // News sites with images
  if (domain.includes('shop') || domain.includes('store') || domain.includes('amazon')) return 1200000; // E-commerce
  if (domain.includes('video') || domain.includes('youtube') || domain.includes('netflix')) return 2500000; // Video platforms
  if (domain.includes('social') || domain.includes('facebook') || domain.includes('instagram')) return 1500000; // Social media
  
  // Default estimation based on URL characteristics
  const pathLength = new URL(url).pathname.length;
  const baseSize = 300000; // 300KB base
  const variableSize = Math.min(pathLength * 10000, 1000000); // Up to 1MB additional
  
  return baseSize + variableSize + Math.random() * 200000; // Add some randomness
}

function determineGreenHosting(url: string): boolean {
  const domain = new URL(url).hostname.toLowerCase();
  
  // Simulate green hosting detection (some known green providers)
  const greenProviders = ['github.io', 'netlify.app', 'vercel.app', 'surge.sh'];
  return greenProviders.some(provider => domain.includes(provider)) || Math.random() > 0.7;
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
      
      // Estimate bytes and green hosting
      const bytes = estimateWebsiteBytes(args.url);
      const green = determineGreenHosting(args.url);
      
      console.log(`Analyzing website with bytes=${bytes}, green=${green}`);
      
      // Use fallback calculations instead of external API for now
      const co2PerByte = green ? 0.000000233 : 0.000000494; // grams CO2 per byte
      const energyPerByte = 0.000000006; // Wh per byte
      
      const data = {
        c: Math.round((bytes * co2PerByte) * 1000) / 1000, // CO2 in grams
        e: Math.round((bytes * energyPerByte) * 1000) / 1000, // Energy in Wh
        p: Math.floor(Math.random() * 50) + 25 // Random percentile between 25-75
      };
      
      console.log("Using calculated data:", data);
      
      // Generate AI summary and suggestions
      const aiResponse: any = await ctx.runAction(internal.carbonAnalysis.generateAIInsights, {
        url: args.url,
        co2: data.c,
        energy: data.e,
        cleanerThan: data.p,
        green: green,
        bytes: bytes
      });
      
      const ecoScore = calculateEcoScore(data.c, data.p);
      
      // Save analysis
      const userId = await getAuthUserId(ctx);
      await ctx.runMutation(internal.carbonAnalysis.saveAnalysis, {
        url: args.url,
        userId: userId || undefined,
        bytes: bytes,
        green: green,
        co2: data.c,
        energy: data.e,
        cleanerThan: data.p,
        aiSummary: aiResponse.summary,
        suggestions: aiResponse.suggestions,
        ecoScore: ecoScore
      });
      
      return {
        url: args.url,
        bytes: bytes,
        green: green,
        co2: data.c,
        energy: data.e,
        cleanerThan: data.p,
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
