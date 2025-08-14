console.log("=== FIXED AI STRATEGY TEST ===");

const BacktestEngine = require("./BacktestEngine");
const FixedAIStrategy = require("./FixedAIStrategy");

async function testFixedStrategy() {
  try {
    console.log("� Testing FIXED strategy with WEAK BUY support...");
    
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
    
    console.log("� FIXED Strategy Parameters:");
    console.log("   � Now supports: BUY, STRONG_BUY, WEAK BUY");
    console.log("   � Also supports: SELL, STRONG_SELL, WEAK SELL");
    console.log("   � Min Confidence: 60%");
    console.log("   � Testing with TSLA (gave WEAK BUY 65%)");
    console.log("");
    
    // Test met TSLA die WEAK BUY gaf + andere stocks
    const symbols = ["TSLA", "AAPL"];
    
    const results = await engine.backtest(fixedAI, symbols, "2025-08-01", "2025-08-13");
    
    console.log("\\n� === FIXED STRATEGY RESULTS ===");
    console.log("� Starting Capital: $" + results.metrics.startingCapital.toLocaleString());
    console.log("� Final Value: $" + results.metrics.finalValue.toLocaleString());
    console.log("� Total Return: " + results.metrics.totalReturn.toFixed(2) + "%");
    console.log("� Total Trades: " + results.metrics.totalTrades);
    
    if (results.metrics.totalTrades > 0) {
      console.log("\\n� SUCCESS! Fixed strategy is working!");
      
      console.log("\\n� Trade History:");
      results.trades.forEach((trade, index) => {
        const action = trade.action === "BUY" ? "�" : "�";
        console.log(`${action} ${trade.date} | ${trade.action} ${trade.quantity} ${trade.symbol} @ $${trade.price.toFixed(2)}`);
        console.log(`   � Reason: ${trade.reason}`);
      });
      
      const profit = results.metrics.finalValue - results.metrics.startingCapital;
      console.log("\\n� Performance:");
      console.log("� Profit: $" + profit.toFixed(2));
      console.log("� Your AI is now trading!");
      
    } else {
      console.log("\\n� Hmm, still no trades. Let me check what happened...");
      
      const strategyInfo = fixedAI.getStrategyInfo();
      console.log("\\n� Debug Info:");
      console.log("� AI Calls: " + strategyInfo.realAICalls);
      console.log("� Avg Confidence: " + strategyInfo.averageConfidence + "%");
      
      console.log("\\n� Try even lower confidence (55%) or test other stocks!");
    }
    
    console.log("\\n✨ Fixed strategy test completed!");
    return results;
    
  } catch (error) {
    console.error("❌ Fixed strategy test failed:", error.message);
  }
}

testFixedStrategy();
