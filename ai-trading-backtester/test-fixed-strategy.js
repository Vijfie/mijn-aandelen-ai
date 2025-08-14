console.log("=== FIXED AI STRATEGY TEST ===");

const BacktestEngine = require("./BacktestEngine");
const FixedAIStrategy = require("./FixedAIStrategy");

async function testFixedStrategy() {
  try {
    console.log("Ì¥ß Testing FIXED strategy with WEAK BUY support...");
    
    const engine = new BacktestEngine({
      startingCapital: 25000,
      commission: 0.001,
      slippage: 0.0005
    });
    
    const fixedAI = new FixedAIStrategy({
      apiUrl: "http://localhost:3001",
      minConfidence: 60,        // TSLA had 65%, should trigger!
      maxPositionSize: 0.4,     // 40% per position
      profitTarget: 0.08,       // 8% profit target
      stopLoss: -0.04          // 4% stop loss
    });
    
    console.log("ÌæØ FIXED Strategy Parameters:");
    console.log("   Ì¥ñ Now supports: BUY, STRONG_BUY, WEAK BUY");
    console.log("   Ì≤∞ Also supports: SELL, STRONG_SELL, WEAK SELL");
    console.log("   Ì≥ä Min Confidence: 60%");
    console.log("   ÌæØ Testing with TSLA (gave WEAK BUY 65%)");
    console.log("");
    
    // Test met TSLA die WEAK BUY gaf + andere stocks
    const symbols = ["TSLA", "AAPL"];
    
    const results = await engine.backtest(fixedAI, symbols, "2025-08-01", "2025-08-13");
    
    console.log("\\nÌæØ === FIXED STRATEGY RESULTS ===");
    console.log("Ì≤∞ Starting Capital: $" + results.metrics.startingCapital.toLocaleString());
    console.log("ÌøÜ Final Value: $" + results.metrics.finalValue.toLocaleString());
    console.log("Ì≥à Total Return: " + results.metrics.totalReturn.toFixed(2) + "%");
    console.log("Ì¥Ñ Total Trades: " + results.metrics.totalTrades);
    
    if (results.metrics.totalTrades > 0) {
      console.log("\\nÌæâ SUCCESS! Fixed strategy is working!");
      
      console.log("\\nÌ≥ã Trade History:");
      results.trades.forEach((trade, index) => {
        const action = trade.action === "BUY" ? "Ìø¢" : "Ì¥¥";
        console.log(`${action} ${trade.date} | ${trade.action} ${trade.quantity} ${trade.symbol} @ $${trade.price.toFixed(2)}`);
        console.log(`   Ì∑† Reason: ${trade.reason}`);
      });
      
      const profit = results.metrics.finalValue - results.metrics.startingCapital;
      console.log("\\nÌ≤∞ Performance:");
      console.log("Ì≤µ Profit: $" + profit.toFixed(2));
      console.log("Ì≥à Your AI is now trading!");
      
    } else {
      console.log("\\nÌ¥î Hmm, still no trades. Let me check what happened...");
      
      const strategyInfo = fixedAI.getStrategyInfo();
      console.log("\\nÌ¥ç Debug Info:");
      console.log("Ì≥ä AI Calls: " + strategyInfo.realAICalls);
      console.log("ÌæØ Avg Confidence: " + strategyInfo.averageConfidence + "%");
      
      console.log("\\nÌ≤° Try even lower confidence (55%) or test other stocks!");
    }
    
    console.log("\\n‚ú® Fixed strategy test completed!");
    return results;
    
  } catch (error) {
    console.error("‚ùå Fixed strategy test failed:", error.message);
  }
}

testFixedStrategy();
