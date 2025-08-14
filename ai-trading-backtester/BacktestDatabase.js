console.log("Creating Backtest Database System...");

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class BacktestDatabase {
  constructor(dbPath = "backtests.db") {
    this.dbPath = dbPath;
    this.db = null;
  }
  
  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error("❌ Database connection failed:", err.message);
          reject(err);
        } else {
          console.log("✅ Connected to SQLite database:", this.dbPath);
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }
  
  async createTables() {
    const tables = {
      // Main backtest runs
      backtests: `
        CREATE TABLE IF NOT EXISTS backtests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          test_name TEXT NOT NULL,
          strategy_name TEXT NOT NULL,
          symbols TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          starting_capital REAL NOT NULL,
          final_value REAL NOT NULL,
          total_return REAL NOT NULL,
          sharpe_ratio REAL,
          max_drawdown REAL,
          total_trades INTEGER,
          trading_days INTEGER,
          ai_calls INTEGER DEFAULT 0,
          ai_success_rate REAL DEFAULT 0,
          avg_confidence REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          parameters TEXT,
          notes TEXT
        )
      `,
      
      // Individual trades
      trades: `
        CREATE TABLE IF NOT EXISTS trades (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          backtest_id INTEGER NOT NULL,
          trade_date TEXT NOT NULL,
          symbol TEXT NOT NULL,
          action TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          commission REAL DEFAULT 0,
          total_value REAL NOT NULL,
          reason TEXT,
          ai_recommendation TEXT,
          ai_confidence REAL,
          FOREIGN KEY (backtest_id) REFERENCES backtests (id)
        )
      `,
      
      // Daily portfolio values
      portfolio_history: `
        CREATE TABLE IF NOT EXISTS portfolio_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          backtest_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          portfolio_value REAL NOT NULL,
          cash REAL NOT NULL,
          positions TEXT,
          daily_return REAL,
          FOREIGN KEY (backtest_id) REFERENCES backtests (id)
        )
      `,
      
      // AI analysis history
      ai_analyses: `
        CREATE TABLE IF NOT EXISTS ai_analyses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          backtest_id INTEGER NOT NULL,
          analysis_date TEXT NOT NULL,
          symbol TEXT NOT NULL,
          price REAL NOT NULL,
          recommendation TEXT NOT NULL,
          confidence REAL NOT NULL,
          fundamental_score REAL,
          technical_score REAL,
          overall_score REAL,
          reasoning TEXT,
          response_time_ms INTEGER,
          FOREIGN KEY (backtest_id) REFERENCES backtests (id)
        )
      `
    };
    
    const promises = Object.entries(tables).map(([tableName, sql]) => {
      return new Promise((resolve, reject) => {
        this.db.run(sql, (err) => {
          if (err) {
            console.error(`❌ Failed to create table ${tableName}:`, err.message);
            reject(err);
          } else {
            console.log(`✅ Table ${tableName} created/verified`);
            resolve();
          }
        });
      });
    });
    
    await Promise.all(promises);
    console.log("✅ All database tables ready!");
  }
  
  async saveBacktest(backtestData) {
    const {
      testName, strategyName, symbols, startDate, endDate,
      startingCapital, finalValue, totalReturn, sharpeRatio,
      maxDrawdown, totalTrades, tradingDays, aiCalls,
      aiSuccessRate, avgConfidence, parameters, notes
    } = backtestData;
    
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO backtests (
          test_name, strategy_name, symbols, start_date, end_date,
          starting_capital, final_value, total_return, sharpe_ratio,
          max_drawdown, total_trades, trading_days, ai_calls,
          ai_success_rate, avg_confidence, parameters, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [
        testName, strategyName, symbols.join(","), startDate, endDate,
        startingCapital, finalValue, totalReturn, sharpeRatio,
        maxDrawdown, totalTrades, tradingDays, aiCalls,
        aiSuccessRate, avgConfidence, JSON.stringify(parameters), notes
      ], function(err) {
        if (err) {
          console.error("❌ Failed to save backtest:", err.message);
          reject(err);
        } else {
          console.log("✅ Backtest saved with ID:", this.lastID);
          resolve(this.lastID);
        }
      });
    });
  }
  
  async saveTrade(backtestId, tradeData) {
    const {
      date, symbol, action, quantity, price, commission,
      totalValue, reason, aiRecommendation, aiConfidence
    } = tradeData;
    
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO trades (
          backtest_id, trade_date, symbol, action, quantity,
          price, commission, total_value, reason, ai_recommendation, ai_confidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [
        backtestId, date, symbol, action, quantity,
        price, commission, totalValue, reason, aiRecommendation, aiConfidence
      ], function(err) {
        if (err) {
          console.error("❌ Failed to save trade:", err.message);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }
  
  async savePortfolioSnapshot(backtestId, date, portfolioValue, cash, positions, dailyReturn) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO portfolio_history (backtest_id, date, portfolio_value, cash, positions, daily_return)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [
        backtestId, date, portfolioValue, cash, JSON.stringify(positions), dailyReturn
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }
  
  async saveAIAnalysis(backtestId, analysisData) {
    const {
      date, symbol, price, recommendation, confidence,
      fundamentalScore, technicalScore, overallScore,
      reasoning, responseTime
    } = analysisData;
    
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO ai_analyses (
          backtest_id, analysis_date, symbol, price, recommendation,
          confidence, fundamental_score, technical_score, overall_score,
          reasoning, response_time_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [
        backtestId, date, symbol, price, recommendation,
        confidence, fundamentalScore, technicalScore, overallScore,
        JSON.stringify(reasoning), responseTime
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }
  
  async getBacktestResults(limit = 10) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM backtests 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      
      this.db.all(sql, [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  
  async getTradesByBacktest(backtestId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM trades 
        WHERE backtest_id = ? 
        ORDER BY trade_date ASC
      `;
      
      this.db.all(sql, [backtestId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  
  async getPerformanceStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_backtests,
          AVG(total_return) as avg_return,
          MAX(total_return) as best_return,
          MIN(total_return) as worst_return,
          AVG(sharpe_ratio) as avg_sharpe,
          AVG(max_drawdown) as avg_drawdown,
          SUM(total_trades) as total_trades_all,
          AVG(ai_success_rate) as avg_ai_success
        FROM backtests
      `;
      
      this.db.get(sql, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
  
  async close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) console.error("❌ Error closing database:", err.message);
        else console.log("✅ Database connection closed");
      });
    }
  }
}

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = BacktestDatabase;
}

// Test database creation
async function testDatabase() {
  console.log("��� Testing database creation...");
  
  const db = new BacktestDatabase("test_backtests.db");
  await db.initialize();
  
  console.log("✅ Database test completed!");
  await db.close();
}

testDatabase().catch(console.error);
