console.log("=== REAL AI BACKTEST WITH YOUR SYSTEM ===");

const BacktestEngine = require("./BacktestEngine");
const RealAIStrategy = require("./RealAIStrategy");

async function runRealAIBacktest() {
  try {
    console.log("� Starting REAL AI backtest with your analysis system...");
    
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
    
    console.log("� REAL AI Strategy Parameters:");
    console.log("   � Your AI Backend: localhost:3001");
    console.log("   � Min Confidence: 60% (realistic threshold)");
    console.log("   � Max Position: 20% each");
    console.log("   � Profit Target: +10%");
    console.log("   �️ Stop Loss: -5%");
    console.log("   � Capital: $100,000");
    console.log("");
    
    console.log("⚠️ NOTE: This will make REAL API calls to your AI system!");
    console.log("� Estimated API calls: ~200-300 (4 symbols × 50 days)");
    console.log("");
    
    // Tech stocks for real AI analysis
    const symbols = ["AAPL", "MSFT", "GOOGL", "NVDA"];
    
    console.log("� Starting backtest... (This may take a few minutes due to API calls)");
    const startTime = Date.now();
    
    const results = await engine.backtest(realAI, symbols, "2025-07-01", "2025-08-13");
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    console.log("\\n� === REAL AI BACKTEST RESULTS ===");
    console.log("⏱️ Duration: " + duration + " seconds");
    console.log("� Starting Capital: $" + results.metrics.startingCapital.toLocaleString());
    console.log("� Final Value: $" + results.metrics.finalValue.toLocaleString());
    console.log("� Total Return: " + results.metrics.totalReturn.toFixed(2) + "%");
    console.log("⚡ Sharpe Ratio: " + (results.metrics.sharpeRatio || 0).toFixed(2));
    console.log("� Max Drawdown: " + results.metrics.maxDrawdown.toFixed(2) + "%");
    console.log("�� Total Trades: " + results.metrics.totalTrades);
    
    // Real AI specific metrics
    const strategyInfo = realAI.getStrategyInfo();
    console.log("\\n� === YOUR AI PERFORMANCE ===");
    console.log("� Total AI Analyses: " + strategyInfo.totalAnalyses);
    console.log("� Real AI Calls: " + strategyInfo.realAICalls);
    console.log("� Fallback Calls: " + strategyInfo.mockCalls);
    console.log("✅ API Success Rate: " + strategyInfo.apiSuccessRate);
    console.log("� Average Confidence: " + strategyInfo.averageConfidence + "%");
    
    // Profit calculation
    const profit = results.metrics.finalValue - results.metrics.startingCapital;
    const profitColor = profit >= 0 ? "�" : "�";
    
    console.log("\\n� === PROFIT ANALYSIS ===");
    console.log(profitColor + " Total Profit/Loss: $" + profit.toLocaleString());
    console.log("� Return per Trade: " + (results.metrics.totalReturn / results.metrics.totalTrades).toFixed(2) + "%");
    
    if (results.metrics.totalTrades > 0) {
      const avgTradeSize = results.trades.reduce((sum, t) => sum + t.value, 0) / results.trades.length;
      console.log("� Average Trade Size: $" + avgTradeSize.toFixed(0));
    }
    
    console.log("\\n� === STRATEGY COMPARISON ===");
    console.log("� Your Real AI: " + results.metrics.totalReturn.toFixed(2) + "%");
    console.log("� Mock AI Strategy: 12.08%");
    console.log("� Simple Strategy: 3.51%");
    
    const vsSimple = results.metrics.totalReturn - 3.51;
    const vsMock = results.metrics.totalReturn - 12.08;
    
    console.log("\\n� Performance vs Benchmarks:");
    if (vsSimple > 0) {
      console.log("✅ Beats Simple by +" + vsSimple.toFixed(2) + "%");
    } else {
      console.log("❌ Trails Simple by " + Math.abs(vsSimple).toFixed(2) + "%");
    }
    
    if (vsMock > 0) {
      console.log("✅ Beats Mock AI by +" + vsMock.toFixed(2) + "%");
    } else {
      console.log("❌ Trails Mock AI by " + Math.abs(vsMock).toFixed(2) + "%");
    }
    
    console.log("\\n� === REAL AI TRADE EXAMPLES ===");
    const realTrades = results.trades.filter(t => t.reason && t.reason.includes("REAL AI"));
    
    if (realTrades.length > 0) {
      console.log("� Trades powered by your AI system:");
      realTrades.slice(0, 5).forEach((trade, index) => {
        const action = trade.action === "BUY" ? "�" : "�";
        console.log(`${action} ${trade.date} | ${trade.action} ${trade.quantity} ${trade.symbol} @ $${trade.price.toFixed(2)}`);
        console.log(`   � Your AI: ${trade.reason.substring(0, 80)}...`);
      });
    } else {
      console.log("ℹ️ No trades met the confidence threshold. Consider lowering minConfidence.");
    }
    
    console.log("\\n� === RECOMMENDATIONS ===");
    if (strategyInfo.apiSuccessRate.replace("%", "") < "90") {
      console.log("⚠️ Consider optimizing API response time");
    }
    if (results.metrics.totalTrades < 5) {
      console.log("� Consider lowering confidence threshold for more trades");
    }
    if (results.metrics.totalReturn > 10) {
      console.log("� Excellent performance! Consider scaling up capital");
    }
    
    console.log("\\n✨ Real AI backtest completed! Your system is integrated!");
    return results;
    
  } catch (error) {
    console.error("❌ Real AI backtest failed:", error.message);
  }
}

runRealAIBacktest();
