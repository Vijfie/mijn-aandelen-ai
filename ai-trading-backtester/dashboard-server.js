console.log("Creating Portfolio Dashboard Server...");

const express = require("express");
const cors = require("cors");
const path = require("path");
const BacktestDatabase = require("./BacktestDatabase");

const app = express();
const PORT = 3002; // Different port from your AI backend

app.use(cors());
app.use(express.json());
app.use(express.static("dashboard"));

let db;

// Initialize database
async function initializeDatabase() {
  db = new BacktestDatabase("backtests.db");
  await db.initialize();
  console.log("âœ… Dashboard database connected");
}

// API Routes

// Get all backtests
app.get("/api/backtests", async (req, res) => {
  try {
    const backtests = await db.getBacktestResults(50);
    res.json(backtests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific backtest details
app.get("/api/backtests/:id", async (req, res) => {
  try {
    const backtestId = req.params.id;
    
    // Get backtest info
    const backtest = await new Promise((resolve, reject) => {
      db.db.get("SELECT * FROM backtests WHERE id = ?", [backtestId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!backtest) {
      return res.status(404).json({ error: "Backtest not found" });
    }
    
    // Get trades
    const trades = await db.getTradesByBacktest(backtestId);
    
    // Get portfolio history
    const portfolioHistory = await new Promise((resolve, reject) => {
      db.db.all("SELECT * FROM portfolio_history WHERE backtest_id = ? ORDER BY date ASC", [backtestId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Get AI analyses
    const aiAnalyses = await new Promise((resolve, reject) => {
      db.db.all("SELECT * FROM ai_analyses WHERE backtest_id = ? ORDER BY analysis_date ASC", [backtestId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({
      backtest,
      trades,
      portfolioHistory,
      aiAnalyses
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get performance stats
app.get("/api/performance", async (req, res) => {
  try {
    const stats = await db.getPerformanceStats();
    
    // Additional calculations
    const recentBacktests = await new Promise((resolve, reject) => {
      db.db.all("SELECT * FROM backtests ORDER BY created_at DESC LIMIT 10", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const totalProfit = recentBacktests.reduce((sum, bt) => sum + (bt.final_value - bt.starting_capital), 0);
    const bestStrategy = recentBacktests.reduce((best, current) => 
      current.total_return > (best?.total_return || -Infinity) ? current : best
    , null);
    
    res.json({
      ...stats,
      totalProfit,
      bestStrategy,
      recentBacktests
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current positions (latest backtest)
app.get("/api/positions", async (req, res) => {
  try {
    const latestBacktest = await new Promise((resolve, reject) => {
      db.db.get("SELECT * FROM backtests ORDER BY created_at DESC LIMIT 1", [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!latestBacktest) {
      return res.json({ positions: [], portfolioValue: 0, cash: 0 });
    }
    
    // Get latest portfolio snapshot
    const latestPortfolio = await new Promise((resolve, reject) => {
      db.db.get("SELECT * FROM portfolio_history WHERE backtest_id = ? ORDER BY date DESC LIMIT 1", [latestBacktest.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    // Get open positions (last buy without matching sell)
    const openTrades = await new Promise((resolve, reject) => {
      db.db.all(`
        SELECT symbol, 
               SUM(CASE WHEN action = \"BUY\" THEN quantity ELSE -quantity END) as net_quantity,
               AVG(CASE WHEN action = \"BUY\" THEN price END) as avg_buy_price,
               MAX(trade_date) as last_trade_date
        FROM trades 
        WHERE backtest_id = ? 
        GROUP BY symbol 
        HAVING net_quantity > 0
      `, [latestBacktest.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json({
      positions: openTrades,
      portfolioValue: latestPortfolio?.portfolio_value || latestBacktest.final_value,
      cash: latestPortfolio?.cash || 0,
      backtestName: latestBacktest.test_name,
      lastUpdate: latestPortfolio?.date || latestBacktest.created_at
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve main dashboard page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard", "index.html"));
});

// Start server
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`íº€ Portfolio Dashboard running at http://localhost:${PORT}`);
  console.log(`í³Š Access your trading dashboard in your browser!`);
});

// Add these routes to dashboard-server.js

app.get("/api/positions/detailed/:backtestId", async (req, res) => {
  try {
    const PositionTracker = require("./PositionTracker");
    const tracker = new PositionTracker();
    await tracker.initialize();
    
    const positions = await tracker.getDetailedPositions(req.params.backtestId);
    const performance = await tracker.getPositionPerformance(req.params.backtestId);
    
    res.json({ positions, performance });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
