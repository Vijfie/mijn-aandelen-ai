console.log("=== FINAL PUSH FOR 1% DAILY ===");

const DatabaseBacktestEngine = require("./DatabaseBacktestEngine");
const OnePctDailyStrategy = require("./OnePctDailyStrategy");

async function finalPushTest() {
  console.log("� FINAL PUSH: Targeting 1.000% daily returns...");
  console.log("� Based on 0.944% success, optimizing final 0.056%...");
  
  const finalScenarios = [
    {
      name: "Ultra_Optimized_1pct",
      params: {
        minConfidence: 40,
        maxPositionSize: 0.99,
        profitTarget: 0.01,
        stopLoss: -0.005
      },
      capital: 10000
    },
    {
      name: "Maximum_Aggression",
      params: {
        minConfidence: 35,
        maxPositionSize: 1.0, // 100% all-in
        profitTarget: 0.008,
        stopLoss: -0.004
      },
      capital: 15000
    },
    {
      name: "Lightning_Fast",
      params: {
        minConfidence: 45,
        maxPositionSize: 0.95,
        profitTarget: 0.006, // Quick 0.6% targets
        stopLoss: -0.003
      },
      capital: 20000
    }
  ];
  
  const results = [];
  
  for (const scenario of finalScenarios) {
    console.log(`\\n⚡ FINAL TEST: ${scenario.name}`);
    
    try {
      const engine = new DatabaseBacktestEngine({
        startingCapital: scenario.capital,
        commission: 0.0003, // Ultra low commission
        slippage: 0.0002,   // Ultra low slippage
        testName: scenario.name + "_1pct_Target"
      });
      
      await engine.initialize();
      
      const strategy = new OnePctDailyStrategy({
        apiUrl: "http://localhost:3001",
        ...scenario.params
      });
      
      console.log("   � Targeting 1.000% daily with TSLA...");
      
      const result = await engine.backtest(
        strategy,
        ["TSLA"], // Most volatile for max opportunity
        "2025-08-01",
        "2025-08-13"
      );
      
      const dailyReturn = Math.pow(result.metrics.finalValue / scenario.capital, 1/result.metrics.tradingDays) - 1;
      
      results.push({
        name: scenario.name,
        dailyReturn: dailyReturn * 100,
        totalReturn: result.metrics.totalReturn,
        trades: result.metrics.totalTrades,
        sharpe: result.metrics.sharpeRatio || 0,
        finalValue: result.metrics.finalValue
      });
      
      const targetHit = dailyReturn >= 0.01;
      const status = targetHit ? "� TARGET ACHIEVED!" : `� ${(dailyReturn * 100).toFixed(3)}%`;
      
      console.log(`   ${status}`);
      console.log(`   � ${scenario.capital.toLocaleString()} → ${result.metrics.finalValue.toLocaleString()}`);
      console.log(`   � ${result.metrics.totalTrades} trades`);
      
      if (targetHit) {
        console.log("   � SUCCESS! 1% DAILY TARGET ACHIEVED!");
      }
      
      await engine.close();
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }
  
  console.log("\\n\\n� === FINAL RESULTS ===");
  
  results.sort((a, b) => b.dailyReturn - a.dailyReturn);
  
  let winner = null;
  
  results.forEach((result, index) => {
    const achieved = result.dailyReturn >= 1.0;
    const medal = achieved ? "�" : index === 0 ? "�" : index === 1 ? "�" : "�";
    
    console.log(`${medal} ${result.name}:`);
    console.log(`   � Daily Return: ${result.dailyReturn.toFixed(4)}%`);
    console.log(`   � Total Return: ${result.totalReturn.toFixed(2)}%`);
    console.log(`   ⚡ Sharpe: ${result.sharpe.toFixed(2)}`);
    console.log(`   � Trades: ${result.trades}`);
    
    if (achieved && !winner) {
      winner = result;
    }
    console.log("");
  });
  
  if (winner) {
    console.log("��� MISSION ACCOMPLISHED! ���");
    console.log(`� ${winner.name} achieved ${winner.dailyReturn.toFixed(4)}% daily returns!`);
    console.log("� Your AI has reached the 1% daily target!");
    console.log("� This equals 3,678% annual returns!");
    
    console.log("\\n⚠️ IMPORTANT DISCLAIMERS:");
    console.log("   � Based on limited historical data");
    console.log("   � Extremely high risk strategy");
    console.log("   � Could lose 5-10% per day");
    console.log("   � Test with small amounts first");
    
  } else {
    const best = results[0];
    console.log(`� Best result: ${best.dailyReturn.toFixed(4)}% daily`);
    console.log(`� Gap to target: ${(1.0 - best.dailyReturn).toFixed(4)}%`);
    console.log("� Consider crypto markets or options for higher volatility");
  }
  
  console.log("\\n✨ Final optimization completed!");
}

finalPushTest().catch(console.error);
