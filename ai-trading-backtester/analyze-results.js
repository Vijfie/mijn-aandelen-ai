console.log("=== DATABASE RESULTS ANALYZER ===");

const BacktestDatabase = require("./BacktestDatabase");

async function analyzeResults() {
  const db = new BacktestDatabase("backtests.db");
  await db.initialize();
  
  console.log("� DETAILED DATABASE ANALYSIS\\n");
  
  // Get all backtests
  const backtests = await db.getBacktestResults(10);
  
  console.log("� DETAILED BACKTEST BREAKDOWN:");
  for (const test of backtests) {
    console.log(`\\n� ${test.test_name}:`);
    console.log(`   � Capital: $${test.starting_capital.toLocaleString()} → $${test.final_value.toLocaleString()}`);
    console.log(`   � Return: ${test.total_return.toFixed(2)}%`);
    console.log(`   ⚡ Sharpe: ${(test.sharpe_ratio || 0).toFixed(2)}`);
    console.log(`   �� Max DD: ${test.max_drawdown.toFixed(2)}%`);
    console.log(`   � Trades: ${test.total_trades} in ${test.trading_days} days`);
    console.log(`   � AI: ${test.ai_calls} calls, ${test.ai_success_rate.toFixed(1)}% success`);
    console.log(`   � Avg Confidence: ${test.avg_confidence.toFixed(1)}%`);
    
    // Get trades for this backtest
    const trades = await db.getTradesByBacktest(test.id);
    if (trades.length > 0) {
      console.log(`   � Trades:`);
      trades.forEach(trade => {
        const action = trade.action === "BUY" ? "�" : "�";
        console.log(`      ${action} ${trade.trade_date} | ${trade.action} ${trade.quantity} ${trade.symbol} @ $${trade.price.toFixed(2)}`);
      });
    }
  }
  
  // Performance stats
  const stats = await db.getPerformanceStats();
  console.log("\\n� AGGREGATE PERFORMANCE STATS:");
  console.log(`   � Total Backtests: ${stats.total_backtests}`);
  console.log(`   � Average Return: ${(stats.avg_return || 0).toFixed(2)}%`);
  console.log(`   � Best Return: ${(stats.best_return || 0).toFixed(2)}%`);
  console.log(`   � Worst Return: ${(stats.worst_return || 0).toFixed(2)}%`);
  console.log(`   ⚡ Average Sharpe: ${(stats.avg_sharpe || 0).toFixed(2)}`);
  console.log(`   � Average Drawdown: ${(stats.avg_drawdown || 0).toFixed(2)}%`);
  console.log(`   � Total Trades: ${stats.total_trades_all}`);
  console.log(`   � AI Success Rate: ${(stats.avg_ai_success || 0).toFixed(1)}%`);
  
  // Strategy recommendations
  console.log("\\n� STRATEGY RECOMMENDATIONS:");
  
  if (stats.best_return > 3) {
    console.log("   ✅ Your AI shows strong profit potential");
    console.log("   � Focus on aggressive tech stocks (TSLA, NVDA)");
    console.log("   � Use 55-60% confidence threshold");
  }
  
  if (stats.avg_sharpe > 1.5) {
    console.log("   ✅ Excellent risk-adjusted returns");
    console.log("   � Your AI manages risk well");
  }
  
  if (stats.total_trades_all > 20) {
    console.log("   ✅ Good trade frequency - not overtrading");
  }
  
  console.log("\\n�� NEXT STEPS:");
  console.log("   1. Focus on Aggressive_Tech parameters");
  console.log("   2. Test with real money (small amount)");
  console.log("   3. Monitor TSLA + NVDA signals daily");
  console.log("   4. Paper trade for 1 month first");
  
  await db.close();
}

analyzeResults().catch(console.error);
