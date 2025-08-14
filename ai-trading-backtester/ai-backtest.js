console.log("=== AI-POWERED BACKTEST ===");

const BacktestEngine = require("./BacktestEngine");
const AIStrategy = require("./AIStrategy");

async function runAIBacktest() {
  try {
    console.log("Ì¥ñ Starting AI-powered backtest...");
    
    const engine = new BacktestEngine({
      startingCapital: 50000, // Meer kapitaal voor AI strategy
      commission: 0.001,
      slippage: 0.0005
    });
    
    const aiStrategy = new AIStrategy({
      minConfidence: 75,        // Alleen trades met 75%+ confidence
      maxPositionSize: 0.25,    // Max 25% per position
      profitTarget: 0.15,       // +15% profit target
      stopLoss: -0.06          // -6% stop loss
    });
    
    console.log("Ì∑† AI Strategy Parameters:");
    console.log("   ÌæØ Min Confidence: 75%");
    console.log("   Ì≤∞ Max Position: 25%");
    console.log("   Ì≥à Profit Target: +15%");
    console.log("   Ìª°Ô∏è Stop Loss: -6%");
    console.log("");
    
    // Test met tech portfolio
    const symbols = ["AAPL", "MSFT", "GOOGL", "NVDA"];
    const results = await engine.backtest(aiStrategy, symbols, "2025-06-01", "2025-08-13");
    
    console.log("\\nÌ¥ñ === AI BACKTEST RESULTS ===");
    console.log("Ì≤∞ Starting Capital: $" + results.metrics.startingCapital.toLocaleString());
    console.log("ÌøÜ Final Value: $" + results.metrics.finalValue.toLocaleString());
    console.log("Ì≥à Total Return: " + results.metrics.totalReturn.toFixed(2) + "%");
    console.log("‚ö° Sharpe Ratio: " + (results.metrics.sharpeRatio || 0).toFixed(2));
    console.log("Ì≥â Max Drawdown: " + results.metrics.maxDrawdown.toFixed(2) + "%");
    console.log("Ì¥Ñ Total Trades: " + results.metrics.totalTrades);
    
    // AI-specific insights
    const strategyInfo = aiStrategy.getStrategyInfo();
    console.log("\\nÌ∑† === AI INSIGHTS ===");
    console.log("Ì≥ä Total AI Analyses: " + strategyInfo.totalAnalyses);
    
    if (strategyInfo.aiInsights) {
      console.log("ÌæØ Average Confidence: " + strategyInfo.aiInsights.averageConfidence + "%");
      console.log("Ì≤™ Strong Signals (80%+): " + strategyInfo.aiInsights.strongSignals);
      console.log("Ì≥ã Recommendation Breakdown:");
      for (const [rec, count] of Object.entries(strategyInfo.aiInsights.recommendationBreakdown)) {
        console.log(`   ${rec}: ${count} times`);
      }
    }
    
    console.log("\\nÌæØ === AI vs SIMPLE STRATEGY COMPARISON ===");
    console.log("Ì¥ñ AI Strategy: " + results.metrics.totalReturn.toFixed(2) + "% return");
    console.log("Ì≥ä Simple Strategy: 3.51% return (previous best)");
    
    const improvement = results.metrics.totalReturn - 3.51;
    if (improvement > 0) {
      console.log("ÌøÜ AI WINS by +" + improvement.toFixed(2) + "% improvement!");
    } else {
      console.log("ÔøΩÔøΩ Simple strategy wins by " + Math.abs(improvement).toFixed(2) + "%");
    }
    
    // Show some AI trade examples
    console.log("\\nÌ¥ñ === AI TRADE EXAMPLES ===");
    results.trades.slice(0, 5).forEach((trade, index) => {
      const action = trade.action === "BUY" ? "Ìø¢" : "Ì¥¥";
      console.log(`${action} ${trade.date} | ${trade.action} ${trade.quantity} ${trade.symbol} @ $${trade.price.toFixed(2)}`);
      console.log(`   Ì≤≠ AI Reason: ${trade.reason || "N/A"}`);
    });
    
    console.log("\\n‚ú® AI backtest completed!");
    return results;
    
  } catch (error) {
    console.error("‚ùå AI backtest failed:", error.message);
  }
}

runAIBacktest();
