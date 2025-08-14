console.log("=== EXTREME STRATEGY TESTING ===");

const DatabaseBacktestEngine = require("./DatabaseBacktestEngine");
const IntradayAIStrategy = require("./IntradayAIStrategy");
const LeveragedAIStrategy = require("./LeveragedAIStrategy");

async function testExtremeStrategies() {
  console.log("Ì∫Ä Testing EXTREME strategies for 1% daily returns...");
  
  const extremeScenarios = [
    {
      name: "Ultra_Aggressive_Intraday",
      strategy: IntradayAIStrategy,
      params: {
        minConfidence: 45,
        maxPositionSize: 0.95,
        profitTarget: 0.015,
        stopLoss: -0.008
      },
      capital: 10000
    },
    {
      name: "Leveraged_3x",
      strategy: LeveragedAIStrategy,
      params: {
        leverage: 3,
        minConfidence: 65,
        maxPositionSize: 0.8,
        profitTarget: 0.005, // 0.5% becomes 1.5% with 3x
        stopLoss: -0.003
      },
      capital: 25000
    },
    {
      name: "High_Frequency_Scalping",
      strategy: IntradayAIStrategy,
      params: {
        minConfidence: 40,
        maxPositionSize: 0.6,
        profitTarget: 0.008, // Quick 0.8% targets
        stopLoss: -0.005,
        scalingFactor: 3
      },
      capital: 15000
    }
  ];
  
  const results = [];
  
  for (const scenario of extremeScenarios) {
    console.log(`\\n‚ö° Testing: ${scenario.name}`);
    
    try {
      const engine = new DatabaseBacktestEngine({
        startingCapital: scenario.capital,
        commission: 0.0005, // Lower commission for HFT
        slippage: 0.0003,
        testName: scenario.name + "_Extreme"
      });
      
      await engine.initialize();
      
      const strategy = new scenario.strategy({
        apiUrl: "http://localhost:3001",
        ...scenario.params
      });
      
      console.log("   Testing with volatile stocks for max opportunity...");
      const volatileSymbols = ["TSLA"]; // Most volatile
      
      const startTime = Date.now();
      const result = await engine.backtest(
        strategy,
        volatileSymbols,
        "2025-08-01", // Short period for quick test
        "2025-08-13"
      );
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      
      const dailyReturn = Math.pow(result.metrics.finalValue / scenario.capital, 1/result.metrics.tradingDays) - 1;
      
      results.push({
        name: scenario.name,
        dailyReturn: dailyReturn * 100,
        totalReturn: result.metrics.totalReturn,
        trades: result.metrics.totalTrades,
        sharpe: result.metrics.sharpeRatio || 0,
        duration: duration
      });
      
      console.log(`   ‚úÖ Daily Return: ${(dailyReturn * 100).toFixed(3)}%`);
      console.log(`   Ì≥ä Total Return: ${result.metrics.totalReturn.toFixed(2)}%`);
      console.log(`   Ì¥Ñ Trades: ${result.metrics.totalTrades}`);
      
      await engine.close();
      
    } catch (error) {
      console.log(`   ‚ùå Failed: ${error.message}`);
    }
  }
  
  console.log("\\n\\nÌøÜ === EXTREME STRATEGY RESULTS ===");
  
  // Sort by daily return
  results.sort((a, b) => b.dailyReturn - a.dailyReturn);
  
  results.forEach((result, index) => {
    const target = result.dailyReturn >= 1.0 ? "ÌæØ TARGET HIT!" : "Ì≥à";
    console.log(`${index + 1}. ${result.name}:`);
    console.log(`   ${target} Daily Return: ${result.dailyReturn.toFixed(3)}%`);
    console.log(`   Ì≥ä Total Return: ${result.totalReturn.toFixed(2)}%`);
    console.log(`   ‚ö° Sharpe: ${result.sharpe.toFixed(2)}`);
    console.log(`   Ì¥Ñ Trades: ${result.trades}`);
    console.log("");
  });
  
  const best = results[0];
  if (best && best.dailyReturn >= 1.0) {
    console.log("Ìæâ SUCCESS! Found strategy achieving 1%+ daily returns!");
    console.log(`ÌøÜ Winner: ${best.name}`);
    console.log(`Ì≥à Daily Rate: ${best.dailyReturn.toFixed(3)}%`);
  } else {
    console.log("‚ö†Ô∏è No strategy achieved 1% daily target");
    console.log("Ì≤° Consider:");
    console.log("   - Higher leverage simulation");
    console.log("   - Crypto/forex markets");
    console.log("   - Options strategies");
    console.log("   - Intraday hour-by-hour data");
  }
  
  console.log("\\n‚ú® Extreme testing completed!");
}

testExtremeStrategies().catch(console.error);
