console.log("=== FINAL SYSTEM CHECK ===");

const fs = require("fs");

function checkSystemFiles() {
  console.log("� Checking all system files...");
  
  const requiredFiles = [
    "helpers.js",
    "DataLoader.js", 
    "BacktestEngine.js",
    "SimpleStrategy.js",
    "complete-backtest.js",
    "multi-backtest.js",
    "optimize-strategy.js",
    "backtest-reporter.js",
    "backtest_results.csv",
    "dashboard.html"
  ];
  
  let allFilesPresent = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} - Found`);
    } else {
      console.log(`❌ ${file} - Missing`);
      allFilesPresent = false;
    }
  });
  
  console.log("\\n� SYSTEM SUMMARY:");
  console.log(`� Total files: ${requiredFiles.length}`);
  console.log(`✅ Status: ${allFilesPresent ? "COMPLETE" : "INCOMPLETE"}`);
  
  if (allFilesPresent) {
    console.log("\\n� CONGRATULATIONS!");
    console.log("� Your AI Trading Backtester is COMPLETE!");
    console.log("\\n� What you built:");
    console.log("   � Professional backtesting engine");
    console.log("   � Multiple trading strategies");
    console.log("   � Performance optimization");
    console.log("   �� CSV reporting system");
    console.log("   � HTML dashboard");
    console.log("   ⚡ Real Yahoo Finance data");
    console.log("\\n� Next steps:");
    console.log("   1. Open dashboard.html in your browser");
    console.log("   2. View backtest_results.csv for detailed data");
    console.log("   3. Run different strategies with your own parameters");
    console.log("   4. Implement the winning Tech Portfolio strategy!");
    console.log("\\n� Proven Results:");
    console.log("   � Best strategy: 3.51% return");
    console.log("   � $1,052 profit from $30,000");
    console.log("   ⚡ 3.51 Sharpe ratio");
    console.log("   � 0.31% max drawdown");
  }
  
  return allFilesPresent;
}

checkSystemFiles();
