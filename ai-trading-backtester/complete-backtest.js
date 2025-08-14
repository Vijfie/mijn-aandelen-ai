console.log("=== COMPLETE BACKTEST RUNNER ===");

const BacktestEngine = require("./BacktestEngine");
const SimpleStrategy = require("./SimpleStrategy");

async function runCompleteBacktest() {
  try {
    console.log("� Initializing complete backtest...");
    
    // Setup
    const engine = new BacktestEngine({
      startingCapital: 10000,
      commission: 0.001,  // 0.1%
      slippage: 0.0005    // 0.05%
    });
    
    const strategy = new SimpleStrategy({
      dipThreshold: -0.03,   // Buy on -3% dip
      profitTarget: 0.02,    // Sell at +2% profit
      stopLoss: -0.05,       // Stop loss at -5%
      maxPositionSize: 0.5   // Max 50% per position
    });
    
    // Test parameters
    const symbols = ["AAPL"];  // Start with just Apple
    const startDate = "2025-07-01";
    const endDate = "2025-08-13";
    
    console.log("� Strategy:", strategy.getStrategyInfo().name);
    console.log("� Symbols:", symbols.join(", "));
    console.log("� Starting Capital: $10,000");
    console.log("");
    
    // Run backtest
    const results = await engine.backtest(strategy, symbols, startDate, endDate);
    
    // Display results
    console.log("\\n=== BACKTEST RESULTS ===");
    console.log("� Starting Capital: $" + results.metrics.startingCapital.toFixed(2));
    console.log("� Final Value: $" + results.metrics.finalValue.toFixed(2));
    console.log("� Total Return: " + results.metrics.totalReturn.toFixed(2) + "%");
    console.log("⚡ Sharpe Ratio: " + (results.metrics.sharpeRatio || 0).toFixed(2));
    console.log("� Max Drawdown: " + results.metrics.maxDrawdown.toFixed(2) + "%");
    console.log("� Total Trades: " + results.metrics.totalTrades);
    console.log("� Trading Days: " + results.metrics.tradingDays);
    
    console.log("\\n=== TRADE HISTORY ===");
    if (results.trades.length > 0) {
      results.trades.forEach((trade, index) => {
        const action = trade.action === "BUY" ? "�" : "�";
        console.log(`${action} ${trade.date} | ${trade.action} ${trade.quantity} ${trade.symbol} @ $${trade.price.toFixed(2)}`);
      });
    } else {
      console.log("No trades executed");
    }
    
    console.log("\\n=== FINAL PORTFOLIO ===");
    console.log("� Cash: $" + results.finalPortfolio.cash.toFixed(2));
    console.log("� Positions:", results.finalPortfolio.positions);
    
    // Calculate some additional metrics
    const profitLoss = results.metrics.finalValue - results.metrics.startingCapital;
    console.log("\\n=== SUMMARY ===");
    console.log("� Strategy Performance:");
    console.log(`   ${profitLoss >= 0 ? "� PROFIT" : "� LOSS"}: $${Math.abs(profitLoss).toFixed(2)}`);
    console.log(`   � ROI: ${results.metrics.totalReturn.toFixed(2)}%`);
    console.log(`   ⏰ Period: ${results.metrics.tradingDays} days`);
    
    if (results.trades.length > 0) {
      const avgTradeValue = results.trades.reduce((sum, trade) => sum + trade.value, 0) / results.trades.length;
      console.log(`   � Average Trade Size: $${avgTradeValue.toFixed(2)}`);
    }
    
    console.log("\\n✅ Backtest completed successfully!");
    return results;
    
  } catch (error) {
    console.error("❌ Backtest failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Run the complete backtest
runCompleteBacktest();
