console.log("=== OPTIMIZED REAL AI BACKTEST ===");

const BacktestEngine = require("./BacktestEngine");
const RealAIStrategy = require("./RealAIStrategy");

async function runOptimizedAIBacktest() {
  try {
    console.log("� Testing your AI with OPTIMIZED parameters...");
    
    const engine = new BacktestEngine({
      startingCapital: 50000,
      commission: 0.001,
      slippage: 0.0005
    });
    
    // VEEL lagere thresholds om je conservatieve AI te activeren
    const optimizedAI = new RealAIStrategy({
      apiUrl: "http://localhost:3001",
      minConfidence: 50,        // 50% threshold - je AI haalt dit WEL
      maxPositionSize: 0.25,    // 25% per position  
      profitTarget: 0.05,       // 5% profit (sneller verkopen)
      stopLoss: -0.03          // 3% stop loss (tighter)
    });
    
    console.log("� OPTIMIZED Strategy Parameters:");
    console.log("   � Min Confidence: 50% (matches your AI average)");
    console.log("   � Max Position: 25%");
    console.log("   � Profit Target: +5% (quick profits)");
    console.log("   �️ Stop Loss: -3% (tight risk)");
    console.log("   � Period: Shorter test (2 weeks)");
    console.log("");
    
    // Kortere periode voor snellere test
    const symbols = ["AAPL", "MSFT"];
    
    console.log("⚡ Quick optimized test starting...");
    const results = await engine.backtest(optimizedAI, symbols, "2025-08-01", "2025-08-13");
    
    console.log("\\n� === OPTIMIZED RESULTS ===");
    console.log("� Starting Capital: $" + results.metrics.startingCapital.toLocaleString());
    console.log("� Final Value: $" + results.metrics.finalValue.toLocaleString());
    console.log("� Total Return: " + results.metrics.totalReturn.toFixed(2) + "%");
    console.log("� Total Trades: " + results.metrics.totalTrades);
    
    const strategyInfo = optimizedAI.getStrategyInfo();
    console.log("\\n� Your AI Stats:");
    console.log("� API Calls: " + strategyInfo.realAICalls);
    console.log("� Avg Confidence: " + strategyInfo.averageConfidence + "%");
    
    if (results.metrics.totalTrades > 0) {
      console.log("\\n� SUCCESS! Your AI is now trading!");
      console.log("\\n� Trade History:");
      results.trades.forEach((trade, index) => {
        const action = trade.action === "BUY" ? "��" : "�";
        console.log(`${action} ${trade.date} | ${trade.action} ${trade.quantity} ${trade.symbol} @ $${trade.price.toFixed(2)}`);
      });
      
      // Performance analysis
      const profit = results.metrics.finalValue - results.metrics.startingCapital;
      console.log("\\n� Performance Analysis:");
      console.log("� Profit: $" + profit.toFixed(2));
      console.log("� Annualized Return: " + (results.metrics.totalReturn * 26).toFixed(2) + "% (if sustained)");
      
    } else {
      console.log("\\n� Still no trades. Your AI is VERY conservative!");
      console.log("\\n� Recommendations:");
      console.log("   1. Lower confidence to 45%");
      console.log("   2. Check if your AI gives any BUY signals");
      console.log("   3. Maybe test with more volatile stocks");
    }
    
    console.log("\\n✨ Optimized test completed!");
    return results;
    
  } catch (error) {
    console.error("❌ Optimized backtest failed:", error.message);
  }
}

runOptimizedAIBacktest();
