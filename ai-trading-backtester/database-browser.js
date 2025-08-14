console.log("=== DATABASE BROWSER ===");

const BacktestDatabase = require("./BacktestDatabase");

async function browseDatabase() {
  const db = new BacktestDatabase("backtests.db");
  await db.initialize();
  
  console.log("Ì≥Å DATABASE FILE STATUS:");
  const fs = require("fs");
  
  if (fs.existsSync("backtests.db")) {
    const stats = fs.statSync("backtests.db");
    console.log("‚úÖ backtests.db exists");
    console.log("Ì≥è File size: " + (stats.size / 1024).toFixed(2) + " KB");
    console.log("Ì≥Ö Last modified: " + stats.mtime);
  } else {
    console.log("‚ùå backtests.db not found!");
  }
  
  // Quick counts
  const backtests = await db.db.all("SELECT COUNT(*) as count FROM backtests");
  const trades = await db.db.all("SELECT COUNT(*) as count FROM trades");
  const analyses = await db.db.all("SELECT COUNT(*) as count FROM ai_analyses");
  
  console.log("\\nÌ≥ä DATABASE CONTENTS:");
  console.log("Ì¥¢ Backtests stored: " + backtests[0].count);
  console.log("Ì≥à Trades recorded: " + trades[0].count);
  console.log("Ì¥ñ AI Analyses saved: " + analyses[0].count);
  
  // Show newest backtest
  const newest = await db.db.all("SELECT * FROM backtests ORDER BY created_at DESC LIMIT 1");
  if (newest.length > 0) {
    const latest = newest[0];
    console.log("\\nÌµê LATEST BACKTEST:");
    console.log("Ì≥ã Name: " + latest.test_name);
    console.log("Ì≥Ö Date: " + latest.created_at);
    console.log("Ì≤∞ Return: " + latest.total_return.toFixed(2) + "%");
    console.log("Ì¥Ñ Trades: " + latest.total_trades);
  }
  
  console.log("\\n‚úÖ Your data is permanently stored!");
  console.log("Ì≤æ Safe to restart computer - data will persist");
  
  await db.close();
}

browseDatabase().catch(console.error);
