console.log("=== REAL AI BACKTEST WITH YOUR SYSTEM ===");

const BacktestEngine = require("./BacktestEngine");
const RealAIStrategy = require("./RealAIStrategy");

async function runRealAIBacktest() {
  try {
    console.log("Ì¥ñ Starting REAL AI backtest with your analysis system...");
    
    const engine = new BacktestEngine({
      startingCapital: 100000, // $100K voor echte AI test
      commission: 0.001,
      slippage: 0.0005
    });
    
    const realAI = new RealAIStrategy({
      apiUrl: "http://localhost:3001",
      minConfidence: 60,        // Lower threshold sinds je AI geeft realistic confidence
      maxPositionSize: 0.2,     // 20% per position
      profitTarget: 0.10,       // 10% profit target
      stopLoss: -0.05          // 5% stop loss
    });
    
    console.log("Ì∑† REAL AI Strategy Parameters:");
    console.log("   ÌæØ Your AI Backend: localhost:3001");
    console.log("   Ì≥ä Min Confidence: 60% (realistic threshold)");
    console.log("   Ì≤∞ Max Position: 20% each");
    console.log("   Ì≥à Profit Target: +10%");
    console.log("   Ìª°Ô∏è Stop Loss: -5%");
    console.log("   Ì≤µ Capital: $100,000");
    console.log("");
    
    console.log("‚ö†Ô∏è NOTE: This will make REAL API calls to your AI system!");
    console.log("Ì≥û Estimated API calls: ~200-300 (4 symbols √ó 50 days)");
    console.log("");
    
    // Tech stocks for real AI analysis
    const symbols = ["AAPL", "MSFT", "GOOGL", "NVDA"];
    
    console.log("Ìµê Starting backtest... (This may take a few minutes due to API calls)");
    const startTime = Date.now();
    
    const results = await engine.backtest(realAI, symbols, "2025-07-01", "2025-08-13");
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    console.log("\\nÌ¥ñ === REAL AI BACKTEST RESULTS ===");
    console.log("‚è±Ô∏è Duration: " + duration + " seconds");
    console.log("Ì≤∞ Starting Capital: $" + results.metrics.startingCapital.toLocaleString());
    console.log("ÌøÜ Final Value: $" + results.metrics.finalValue.toLocaleString());
    console.log("Ì≥à Total Return: " + results.metrics.totalReturn.toFixed(2) + "%");
    console.log("‚ö° Sharpe Ratio: " + (results.metrics.sharpeRatio || 0).toFixed(2));
    console.log("Ì≥â Max Drawdown: " + results.metrics.maxDrawdown.toFixed(2) + "%");
    console.log("ÔøΩÔøΩ Total Trades: " + results.metrics.totalTrades);
    
    // Real AI specific metrics
    const strategyInfo = realAI.getStrategyInfo();
    console.log("\\nÌ∑† === YOUR AI PERFORMANCE ===");
    console.log("Ì≥ä Total AI Analyses: " + strategyInfo.totalAnalyses);
    console.log("Ì¥ñ Real AI Calls: " + strategyInfo.realAICalls);
    console.log("Ì¥Ñ Fallback Calls: " + strategyInfo.mockCalls);
    console.log("‚úÖ API Success Rate: " + strategyInfo.apiSuccessRate);
    console.log("ÌæØ Average Confidence: " + strategyInfo.averageConfidence + "%");
    
    // Profit calculation
    const profit = results.metrics.finalValue - results.metrics.startingCapital;
    const profitColor = profit >= 0 ? "Ìø¢" : "Ì¥¥";
    
    console.log("\\nÌ≤∞ === PROFIT ANALYSIS ===");
    console.log(profitColor + " Total Profit/Loss: $" + profit.toLocaleString());
    console.log("Ì≥ä Return per Trade: " + (results.metrics.totalReturn / results.metrics.totalTrades).toFixed(2) + "%");
    
    if (results.metrics.totalTrades > 0) {
      const avgTradeSize = results.trades.reduce((sum, t) => sum + t.value, 0) / results.trades.length;
      console.log("Ì≤µ Average Trade Size: $" + avgTradeSize.toFixed(0));
    }
    
    console.log("\\nÌøÜ === STRATEGY COMPARISON ===");
    console.log("Ì¥ñ Your Real AI: " + results.metrics.totalReturn.toFixed(2) + "%");
    console.log("Ì¥π Mock AI Strategy: 12.08%");
    console.log("Ì¥∏ Simple Strategy: 3.51%");
    
    const vsSimple = results.metrics.totalReturn - 3.51;
    const vsMock = results.metrics.totalReturn - 12.08;
    
    console.log("\\nÌ≥à Performance vs Benchmarks:");
    if (vsSimple > 0) {
      console.log("‚úÖ Beats Simple by +" + vsSimple.toFixed(2) + "%");
    } else {
      console.log("‚ùå Trails Simple by " + Math.abs(vsSimple).toFixed(2) + "%");
    }
    
    if (vsMock > 0) {
      console.log("‚úÖ Beats Mock AI by +" + vsMock.toFixed(2) + "%");
    } else {
      console.log("‚ùå Trails Mock AI by " + Math.abs(vsMock).toFixed(2) + "%");
    }
    
    console.log("\\nÌ¥ñ === REAL AI TRADE EXAMPLES ===");
    const realTrades = results.trades.filter(t => t.reason && t.reason.includes("REAL AI"));
    
    if (realTrades.length > 0) {
      console.log("Ì≥ä Trades powered by your AI system:");
      realTrades.slice(0, 5).forEach((trade, index) => {
        const action = trade.action === "BUY" ? "Ìø¢" : "Ì¥¥";
        console.log(`${action} ${trade.date} | ${trade.action} ${trade.quantity} ${trade.symbol} @ $${trade.price.toFixed(2)}`);
        console.log(`   Ì∑† Your AI: ${trade.reason.substring(0, 80)}...`);
      });
    } else {
      console.log("‚ÑπÔ∏è No trades met the confidence threshold. Consider lowering minConfidence.");
    }
    
    console.log("\\nÌæØ === RECOMMENDATIONS ===");
    if (strategyInfo.apiSuccessRate.replace("%", "") < "90") {
      console.log("‚ö†Ô∏è Consider optimizing API response time");
    }
    if (results.metrics.totalTrades < 5) {
      console.log("Ì≤° Consider lowering confidence threshold for more trades");
    }
    if (results.metrics.totalReturn > 10) {
      console.log("Ì∫Ä Excellent performance! Consider scaling up capital");
    }
    
    console.log("\\n‚ú® Real AI backtest completed! Your system is integrated!");
    return results;
    
  } catch (error) {
    console.error("‚ùå Real AI backtest failed:", error.message);
  }
}

runRealAIBacktest();
