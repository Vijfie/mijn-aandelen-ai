console.log("Creating Advanced Position Tracker...");

const BacktestDatabase = require("./BacktestDatabase");

class PositionTracker {
  constructor() {
    this.db = new BacktestDatabase("backtests.db");
  }
  
  async initialize() {
    await this.db.initialize();
  }
  
  async getDetailedPositions(backtestId) {
    // Get all trades for the backtest
    const trades = await this.db.getTradesByBacktest(backtestId);
    
    // Calculate position details
    const positions = new Map();
    
    trades.forEach(trade => {
      if (!positions.has(trade.symbol)) {
        positions.set(trade.symbol, {
          symbol: trade.symbol,
          totalQuantity: 0,
          totalValue: 0,
          trades: [],
          realizedPnL: 0,
          openQuantity: 0,
          avgOpenPrice: 0,
          lastPrice: 0
        });
      }
      
      const pos = positions.get(trade.symbol);
      pos.trades.push(trade);
      pos.lastPrice = trade.price;
      
      if (trade.action === "BUY") {
        pos.openQuantity += trade.quantity;
        pos.totalValue += trade.total_value;
        
        // Recalculate average price
        if (pos.openQuantity > 0) {
          pos.avgOpenPrice = pos.totalValue / pos.openQuantity;
        }
        
      } else if (trade.action === "SELL") {
        const sellQuantity = Math.min(trade.quantity, pos.openQuantity);
        const sellValue = sellQuantity * pos.avgOpenPrice;
        
        // Calculate realized P&L
        pos.realizedPnL += (trade.price - pos.avgOpenPrice) * sellQuantity;
        
        pos.openQuantity -= sellQuantity;
        pos.totalValue -= sellValue;
        
        if (pos.openQuantity <= 0) {
          pos.avgOpenPrice = 0;
          pos.totalValue = 0;
        }
      }
    });
    
    return Array.from(positions.values());
  }
  
  async getPositionPerformance(backtestId) {
    const positions = await this.getDetailedPositions(backtestId);
    
    const performance = {
      totalRealizedPnL: 0,
      totalUnrealizedPnL: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      bestTrade: null,
      worstTrade: null
    };
    
    positions.forEach(pos => {
      performance.totalRealizedPnL += pos.realizedPnL;
      
      // Calculate unrealized P&L for open positions
      if (pos.openQuantity > 0) {
        const unrealizedPnL = (pos.lastPrice - pos.avgOpenPrice) * pos.openQuantity;
        performance.totalUnrealizedPnL += unrealizedPnL;
      }
      
      // Analyze individual trades
      let currentBuyPrice = 0;
      pos.trades.forEach(trade => {
        if (trade.action === "BUY") {
          currentBuyPrice = trade.price;
        } else if (trade.action === "SELL" && currentBuyPrice > 0) {
          const tradePnL = (trade.price - currentBuyPrice) * trade.quantity;
          
          if (tradePnL > 0) {
            performance.winningTrades++;
          } else {
            performance.losingTrades++;
          }
          
          if (!performance.bestTrade || tradePnL > performance.bestTrade.pnl) {
            performance.bestTrade = { ...trade, pnl: tradePnL, buyPrice: currentBuyPrice };
          }
          
          if (!performance.worstTrade || tradePnL < performance.worstTrade.pnl) {
            performance.worstTrade = { ...trade, pnl: tradePnL, buyPrice: currentBuyPrice };
          }
        }
      });
    });
    
    const totalTrades = performance.winningTrades + performance.losingTrades;
    performance.winRate = totalTrades > 0 ? (performance.winningTrades / totalTrades) * 100 : 0;
    
    return performance;
  }
}

// Export
if (typeof module !== "undefined" && module.exports) {
  module.exports = PositionTracker;
}

console.log("✅ Advanced Position Tracker created!");
