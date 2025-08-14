console.log("=== TESTING YOUR REAL AI ===");

const RealAIStrategy = require("./RealAIStrategy");

async function testRealAI() {
  console.log("� Testing connection to your AI backend...");
  
  const strategy = new RealAIStrategy({
    apiUrl: "http://localhost:3001", // Pas aan naar jouw backend URL
    minConfidence: 70
  });
  
  // Test single AI call
  try {
    console.log("\\n1. Testing single AI analysis call...");
    const result = await strategy.callRealAI("AAPL");
    
    console.log("✅ AI Response received:");
    console.log("   � Recommendation:", result.recommendation);
    console.log("   � Confidence:", result.confidence + "%");
    console.log("   � Reasoning:", result.reasoning.slice(0, 2).join(", "));
    console.log("   � Scores:", {
      fundamental: result.fundamentalScore,
      technical: result.technicalScore,
      overall: result.overallScore
    });
    console.log("   � Source:", result.source);
    
    console.log("\\n� SUCCESS! Your AI is responding correctly!");
    console.log("\\n� Ready to run full backtest with your real AI!");
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\\n� Troubleshooting:");
    console.log("   1. Is your backend running on http://localhost:3001?");
    console.log("   2. Check if /api/analyze endpoint exists");
    console.log("   3. Verify CORS settings allow requests");
    console.log("   4. Test manually: curl -X POST http://localhost:3001/api/analyze -H \"Content-Type: application/json\" -d \"{\\\"question\\\":\\\"Analyseer AAPL\\\"}\"");
  }
}

testRealAI();
