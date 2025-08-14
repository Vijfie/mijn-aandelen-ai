console.log("=== MULTI-SYMBOL BACKTEST ===");

const BacktestEngine = require("./BacktestEngine");
const SimpleStrategy = require("./SimpleStrategy");

async function runMultiSymbolBacktest() {
  try {
    console.log("Ìºü Running advanced multi-symbol backtest...");
    
    const engine = new BacktestEngine({
      startingCapital: 25000,  // Meer kapitaal voor meerdere aandelen
      commission: 0.001,
      slippage: 0.0005
    });
    
    const strategy = new SimpleStrategy({
      dipThreshold: -0.025,      // -2.5% dip (minder streng)
      profitTarget: 0.015,       // +1.5% profit (sneller winst nemen)
      stopLoss: -0.04,          // -4% stop loss
      maxPositionSize: 0.25     // Max 25% per positie (4 posities mogelijk)
    });
    
    // Test met meerdere tech aandelen
    const symbols = ["AAPL", "MSFT", "GOOGL"];
    const startDate = "2025-06-01";
    const endDate = "2025-08-13";
    
    console.log("ÌæØ Advanced Strategy Parameters:");
    console.log("   Ì≤∞ Capital: $25,000");
    console.log("   Ì≥ä Symbols: " + symbols.join(", "));
    console.log("   ÌæõÔ∏è Dip Threshold: -2.5%");
    console.log("   ÌæØ Profit Target: +1.5%");
    console.log("   Ìª°Ô∏è Stop Loss: -4%");
    console.log("   Ì≥¶ Max Position: 25% each");
    console.log("");
    
    const results = await engine.backtest(strategy, symbols, startDate, endDate);
    
    console.log("\\nÌøÜ === ADVANCED RESULTS ===");
    console.log("Ì≤∞ Starting Capital: $" + results.metrics.startingCapital.toLocaleString());
    console.log("ÌøÜ Final Value: $" + results.metrics.finalValue.toLocaleString());
    console.log("Ì≥à Total Return: " + results.metrics.totalReturn.toFixed(2) + "%");
    console.log("‚ö° Sharpe Ratio: " + (results.metrics.sharpeRatio || 0).toFixed(2));
    console.log("Ì≥â Max Drawdown: " + results.metrics.maxDrawdown.toFixed(2) + "%");
    console.log("Ì¥Ñ Total Trades: " + results.metrics.totalTrades);
    console.log("Ì≥Ö Trading Days: " + results.metrics.tradingDays);
    
    // Calculate additional metrics
    const profit = results.metrics.finalValue - results.metrics.startingCapital;
    const dailyReturn = Math.pow(results.metrics.finalValue / results.metrics.startingCapital, 1/results.metrics.tradingDays) - 1;
    const annualizedReturn = Math.pow(1 + dailyReturn, 252) - 1; // 252 trading days per year
    
    console.log("\\nÌ≥ä === ADVANCED METRICS ===");
    console.log("Ì≤µ Total Profit/Loss: $" + profit.toFixed(2));
    console.log("Ì≥Ö Daily Return: " + (dailyReturn * 100).toFixed(3) + "%");
    console.log("Ì≥à Annualized Return: " + (annualizedReturn * 100).toFixed(2) + "%");
    
    if (results.trades.length > 0) {
      const buyTrades = results.trades.filter(t => t.action === "BUY");
      const sellTrades = results.trades.filter(t => t.action === "SELL");
      console.log("Ìø¢ Buy Orders: " + buyTrades.length);
      console.log("Ì¥¥ Sell Orders: " + sellTrades.length);
      
      // Calculate win rate
      const completedRoundTrips = Math.min(buyTrades.length, sellTrades.length);
      if (completedRoundTrips > 0) {
        console.log("ÌæØ Completed Round Trips: " + completedRoundTrips);
      }
    }
    
    console.log("\\nÌ¥ç === TRADE BREAKDOWN BY SYMBOL ===");
    const tradesBySymbol = {};
    results.trades.forEach(trade => {
      if (!tradesBySymbol[trade.symbol]) {
        tradesBySymbol[trade.symbol] = { buys: 0, sells: 0, totalValue: 0 };
      }
      tradesBySymbol[trade.symbol][trade.action.toLowerCase() + "s"]++;
      tradesBySymbol[trade.symbol].totalValue += trade.value;
    });
    
    for (const [symbol, stats] of Object.entries(tradesBySymbol)) {
      console.log(`Ì≥ä ${symbol}: ${stats.buys} buys, ${stats.sells} sells, $${stats.totalValue.toFixed(0)} total volume`);
    }
    
    console.log("\\n‚ú® Multi-symbol backtest completed successfully!");
    return results;
    
  } catch (error) {
    console.error("‚ùå Multi-symbol backtest failed:", error.message);
  }
}

runMultiSymbolBacktest();
