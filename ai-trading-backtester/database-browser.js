console.log("=== DATABASE BROWSER ===");

const BacktestDatabase = require("./BacktestDatabase");

async function browseDatabase() {
  const db = new BacktestDatabase("backtests.db");
  await db.initialize();
  
  console.log("� DATABASE FILE STATUS:");
  const fs = require("fs");
  
  if (fs.existsSync("backtests.db")) {
    const stats = fs.statSync("backtests.db");
    console.log("✅ backtests.db exists");
    console.log("� File size: " + (stats.size / 1024).toFixed(2) + " KB");
    console.log("� Last modified: " + stats.mtime);
  } else {
    console.log("❌ backtests.db not found!");
  }
  
  // Quick counts
  const backtests = await db.db.all("SELECT COUNT(*) as count FROM backtests");
  const trades = await db.db.all("SELECT COUNT(*) as count FROM trades");
  const analyses = await db.db.all("SELECT COUNT(*) as count FROM ai_analyses");
  
  console.log("\\n� DATABASE CONTENTS:");
  console.log("� Backtests stored: " + backtests[0].count);
  console.log("� Trades recorded: " + trades[0].count);
  console.log("� AI Analyses saved: " + analyses[0].count);
  
  // Show newest backtest
  const newest = await db.db.all("SELECT * FROM backtests ORDER BY created_at DESC LIMIT 1");
  if (newest.length > 0) {
    const latest = newest[0];
    console.log("\\n� LATEST BACKTEST:");
    console.log("� Name: " + latest.test_name);
    console.log("� Date: " + latest.created_at);
    console.log("� Return: " + latest.total_return.toFixed(2) + "%");
    console.log("� Trades: " + latest.total_trades);
  }
  
  console.log("\\n✅ Your data is permanently stored!");
  console.log("� Safe to restart computer - data will persist");
  
  await db.close();
}

browseDatabase().catch(console.error);
