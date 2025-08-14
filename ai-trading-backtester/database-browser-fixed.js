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
  
  try {
    // Fixed queries
    const backtestCount = await new Promise((resolve, reject) => {
      db.db.get("SELECT COUNT(*) as count FROM backtests", [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    const tradeCount = await new Promise((resolve, reject) => {
      db.db.get("SELECT COUNT(*) as count FROM trades", [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    const analysisCount = await new Promise((resolve, reject) => {
      db.db.get("SELECT COUNT(*) as count FROM ai_analyses", [], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log("\\n� DATABASE CONTENTS:");
    console.log("� Backtests stored: " + backtestCount);
    console.log("� Trades recorded: " + tradeCount);
    console.log("� AI Analyses saved: " + analysisCount);
    
    // Show all backtests
    const allBacktests = await new Promise((resolve, reject) => {
      db.db.all("SELECT * FROM backtests ORDER BY created_at DESC", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log("\\n� ALL STORED BACKTESTS:");
    allBacktests.forEach((bt, index) => {
      console.log(`${index + 1}. ${bt.test_name}:`);
      console.log(`   � ${bt.starting_capital.toLocaleString()} → ${bt.final_value.toLocaleString()}`);
      console.log(`   � Return: ${bt.total_return.toFixed(2)}%`);
      console.log(`   ⚡ Sharpe: ${(bt.sharpe_ratio || 0).toFixed(2)}`);
      console.log(`   � Trades: ${bt.total_trades}`);
      console.log(`   � Date: ${bt.created_at}`);
      console.log("");
    });
    
    // Show some sample trades
    const sampleTrades = await new Promise((resolve, reject) => {
      db.db.all("SELECT * FROM trades LIMIT 10", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log("� SAMPLE TRADES:");
    sampleTrades.forEach(trade => {
      const action = trade.action === "BUY" ? "�" : "�";
      console.log(`${action} ${trade.trade_date} | ${trade.action} ${trade.quantity} ${trade.symbol} @ $${trade.price.toFixed(2)}`);
    });
    
    console.log("\\n✅ ALL YOUR DATA IS PERMANENTLY STORED!");
    console.log("� Safe to restart computer - data persists");
    console.log("� " + backtestCount + " backtests, " + tradeCount + " trades saved forever");
    
  } catch (error) {
    console.error("Query error:", error.message);
  }
  
  await db.close();
}

browseDatabase().catch(console.error);
