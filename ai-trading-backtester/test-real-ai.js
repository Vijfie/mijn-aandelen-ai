console.log("=== TESTING YOUR REAL AI ===");

const RealAIStrategy = require("./RealAIStrategy");

async function testRealAI() {
  console.log("Ì¥ç Testing connection to your AI backend...");
  
  const strategy = new RealAIStrategy({
    apiUrl: "http://localhost:3001", // Pas aan naar jouw backend URL
    minConfidence: 70
  });
  
  // Test single AI call
  try {
    console.log("\\n1. Testing single AI analysis call...");
    const result = await strategy.callRealAI("AAPL");
    
    console.log("‚úÖ AI Response received:");
    console.log("   Ì≥ä Recommendation:", result.recommendation);
    console.log("   ÌæØ Confidence:", result.confidence + "%");
    console.log("   Ì≤≠ Reasoning:", result.reasoning.slice(0, 2).join(", "));
    console.log("   Ì≥à Scores:", {
      fundamental: result.fundamentalScore,
      technical: result.technicalScore,
      overall: result.overallScore
    });
    console.log("   Ì¥ó Source:", result.source);
    
    console.log("\\nÌæâ SUCCESS! Your AI is responding correctly!");
    console.log("\\nÌ∫Ä Ready to run full backtest with your real AI!");
    
  } catch (error) {
    console.error("‚ùå Connection failed:", error.message);
    console.log("\\nÌ¥ß Troubleshooting:");
    console.log("   1. Is your backend running on http://localhost:3001?");
    console.log("   2. Check if /api/analyze endpoint exists");
    console.log("   3. Verify CORS settings allow requests");
    console.log("   4. Test manually: curl -X POST http://localhost:3001/api/analyze -H \"Content-Type: application/json\" -d \"{\\\"question\\\":\\\"Analyseer AAPL\\\"}\"");
  }
}

testRealAI();
