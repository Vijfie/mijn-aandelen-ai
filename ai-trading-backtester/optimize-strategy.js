console.log("=== PORTFOLIO OPTIMIZER ===");

const BacktestEngine = require("./BacktestEngine");
const SimpleStrategy = require("./SimpleStrategy");

async function optimizeStrategy() {
  console.log("� Strategy optimization starting...");
  
  const baseParams = {
    startingCapital: 10000,
    symbols: ["AAPL"],
    startDate: "2025-07-01",
    endDate: "2025-08-13"
  };
  
  // Test verschillende parameter combinaties
  const testCases = [
    { dipThreshold: -0.02, profitTarget: 0.015, name: "Conservative" },
    { dipThreshold: -0.03, profitTarget: 0.02,  name: "Balanced" },
    { dipThreshold: -0.04, profitTarget: 0.025, name: "Aggressive" },
    { dipThreshold: -0.025, profitTarget: 0.03, name: "Patient" }
  ];
  
  console.log("� Testing " + testCases.length + " strategy variations...");
  console.log("");
  
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`[${i+1}/${testCases.length}] Testing ${testCase.name} strategy...`);
    
    try {
      const engine = new BacktestEngine(baseParams);
      const strategy = new SimpleStrategy({
        dipThreshold: testCase.dipThreshold,
        profitTarget: testCase.profitTarget,
        stopLoss: -0.05,
        maxPositionSize: 0.5
      });
      
      const result = await engine.backtest(strategy, baseParams.symbols, baseParams.startDate, baseParams.endDate);
      
      results.push({
        name: testCase.name,
        parameters: testCase,
        metrics: result.metrics,
        totalTrades: result.trades.length
      });
      
      console.log(`   ✅ ${testCase.name}: ${result.metrics.totalReturn.toFixed(2)}% return, ${result.trades.length} trades`);
      
    } catch (error) {
      console.log(`   ❌ ${testCase.name}: Failed - ${error.message}`);
    }
  }
  
  console.log("\\n� === OPTIMIZATION RESULTS ===");
  
  // Sort by total return
  results.sort((a, b) => b.metrics.totalReturn - a.metrics.totalReturn);
  
  console.log("� Strategy Rankings (by Total Return):");
  results.forEach((result, index) => {
    const rank = index + 1;
    const medal = rank === 1 ? "�" : rank === 2 ? "�" : rank === 3 ? "�" : "  ";
    console.log(`${medal} ${rank}. ${result.name}: ${result.metrics.totalReturn.toFixed(2)}% (${result.totalTrades} trades, Sharpe: ${(result.metrics.sharpeRatio || 0).toFixed(2)})`);
  });
  
  if (results.length > 0) {
    const best = results[0];
    console.log("\\n� === OPTIMAL STRATEGY ===");
    console.log("� Best Strategy: " + best.name);
    console.log("� Total Return: " + best.metrics.totalReturn.toFixed(2) + "%");
    console.log("� Parameters:");
    console.log("   � Dip Threshold: " + (best.parameters.dipThreshold * 100).toFixed(1) + "%");
    console.log("   � Profit Target: " + (best.parameters.profitTarget * 100).toFixed(1) + "%");
    console.log("   � Total Trades: " + best.totalTrades);
    console.log("   ⚡ Sharpe Ratio: " + (best.metrics.sharpeRatio || 0).toFixed(2));
  }
  
  console.log("\\n✨ Strategy optimization completed!");
}

optimizeStrategy();
