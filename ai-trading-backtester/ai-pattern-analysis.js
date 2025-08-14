console.log("=== AI RECOMMENDATION ANALYSIS ===");

const RealAIStrategy = require("./RealAIStrategy");

async function analyzeAIPattern() {
  console.log("Ì¥ç Analyzing your AI recommendation patterns...");
  
  const strategy = new RealAIStrategy({
    apiUrl: "http://localhost:3001",
    minConfidence: 40  // Very low threshold to see what AI recommends
  });
  
  const symbols = ["AAPL", "MSFT", "GOOGL", "NVDA", "TSLA"];
  const recommendations = new Map();
  
  console.log("\\nÌ≥ä Testing AI recommendations for popular stocks...");
  
  for (const symbol of symbols) {
    try {
      const analysis = await strategy.callRealAI(symbol);
      recommendations.set(symbol, analysis);
      
      console.log(`${symbol}: ${analysis.recommendation} (${analysis.confidence}%)`);
      console.log(`   Ì≤≠ Reasoning: ${analysis.reasoning.slice(0, 2).join(" | ")}`);
      console.log("");
      
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
    } catch (error) {
      console.log(`‚ùå ${symbol}: ${error.message}`);
    }
  }
  
  // Analysis
  console.log("\\nÌ∑† === AI PATTERN ANALYSIS ===");
  
  const recCounts = {};
  const confidences = [];
  
  for (const [symbol, analysis] of recommendations) {
    recCounts[analysis.recommendation] = (recCounts[analysis.recommendation] || 0) + 1;
    confidences.push(analysis.confidence);
  }
  
  console.log("Ì≥à Recommendation Distribution:");
  for (const [rec, count] of Object.entries(recCounts)) {
    console.log(`   ${rec}: ${count} times`);
  }
  
  const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  const maxConfidence = Math.max(...confidences);
  const minConfidence = Math.min(...confidences);
  
  console.log("\\nÌæØ Confidence Analysis:");
  console.log(`   Average: ${avgConfidence.toFixed(1)}%`);
  console.log(`   Range: ${minConfidence}% - ${maxConfidence}%`);
  
  const buyRecommendations = Array.from(recommendations.values()).filter(a => 
    a.recommendation === "BUY" || a.recommendation === "STRONG_BUY"
  );
  
  console.log("\\nÌ≤° Trading Insights:");
  if (buyRecommendations.length === 0) {
    console.log("   ‚ö†Ô∏è Your AI gives NO BUY signals for major tech stocks");
    console.log("   Ì¥ß Consider:");
    console.log("      - Testing different market conditions");
    console.log("      - Adjusting AI parameters");
    console.log("      - Using HOLD signals as weak buys");
  } else {
    console.log(`   ‚úÖ Found ${buyRecommendations.length} BUY recommendations`);
  }
  
  console.log("\\n‚ú® AI pattern analysis completed!");
}

analyzeAIPattern();
