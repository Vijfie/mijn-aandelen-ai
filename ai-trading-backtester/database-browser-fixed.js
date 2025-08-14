console.log("=== DATABASE BROWSER ===");

const BacktestDatabase = require("./BacktestDatabase");

async function browseDatabase() {
  const db = new BacktestDatabase("backtests.db");
  await db.initialize();
  
  console.log("í³ DATABASE FILE STATUS:");
  const fs = require("fs");
  
  if (fs.existsSync("backtests.db")) {
    const stats = fs.statSync("backtests.db");
    console.log("âœ… backtests.db exists");
    console.log("í³ File size: " + (stats.size / 1024).toFixed(2) + " KB");
    console.log("í³… Last modified: " + stats.mtime);
  } else {
    console.log("âŒ backtests.db not found!");
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
    
    console.log("\\ní³Š DATABASE CONTENTS:");
    console.log("í´¢ Backtests stored: " + backtestCount);
    console.log("í³ˆ Trades recorded: " + tradeCount);
    console.log("í´– AI Analyses saved: " + analysisCount);
    
    // Show all backtests
    const allBacktests = await new Promise((resolve, reject) => {
      db.db.all("SELECT * FROM backtests ORDER BY created_at DESC", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log("\\ní³‹ ALL STORED BACKTESTS:");
    allBacktests.forEach((bt, index) => {
      console.log(`${index + 1}. ${bt.test_name}:`);
      console.log(`   í²° ${bt.starting_capital.toLocaleString()} â†’ ${bt.final_value.toLocaleString()}`);
      console.log(`   í³ˆ Return: ${bt.total_return.toFixed(2)}%`);
      console.log(`   âš¡ Sharpe: ${(bt.sharpe_ratio || 0).toFixed(2)}`);
      console.log(`   í´„ Trades: ${bt.total_trades}`);
      console.log(`   í³… Date: ${bt.created_at}`);
      console.log("");
    });
    
    // Show some sample trades
    const sampleTrades = await new Promise((resolve, reject) => {
      db.db.all("SELECT * FROM trades LIMIT 10", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log("í³Š SAMPLE TRADES:");
    sampleTrades.forEach(trade => {
      const action = trade.action === "BUY" ? "í¿¢" : "í´´";
      console.log(`${action} ${trade.trade_date} | ${trade.action} ${trade.quantity} ${trade.symbol} @ $${trade.price.toFixed(2)}`);
    });
    
    console.log("\\nâœ… ALL YOUR DATA IS PERMANENTLY STORED!");
    console.log("í²¾ Safe to restart computer - data persists");
    console.log("í´„ " + backtestCount + " backtests, " + tradeCount + " trades saved forever");
    
  } catch (error) {
    console.error("Query error:", error.message);
  }
  
  await db.close();
}

browseDatabase().catch(console.error);
