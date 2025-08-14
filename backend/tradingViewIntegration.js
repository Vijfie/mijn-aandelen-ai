// backend/tradingViewIntegration.js - Automatische Position Sync
const express = require('express');
const tradeLogger = require('./tradeLogger');
const aiLearningEngine = require('./aiLearningEngine');

class TradingViewIntegration {
  constructor() {
    this.activePositions = new Map();
    this.webhookSecret = process.env.TRADINGVIEW_WEBHOOK_SECRET || 'your-secret-key';
  }

  // 📊 Setup webhook routes
  setupWebhookRoutes(app) {
    // TradingView Webhook Endpoint
    app.post('/api/webhook/tradingview', this.handleTradingViewWebhook.bind(this));
    
    // Manual position sync endpoint  
    app.post('/api/sync/position', this.handleManualPositionSync.bind(this));
    
    // Get active positions
    app.get('/api/positions/active', this.getActivePositions.bind(this));
    
    console.log('🔗 TradingView Webhook Integration activated!');
    console.log('📊 Webhook URL: http://localhost:3001/api/webhook/tradingview');
  }

  // 🎯 Handle TradingView Webhook
  async handleTradingViewWebhook(req, res) {
    try {
      const { 
        action,     // 'BUY' | 'SELL' | 'CLOSE'
        symbol,     // 'AAPL'
        quantity,   // 100
        price,      // 150.25
        timestamp,  // '2025-01-15T10:30:00Z'
        strategy,   // 'AI_TEST_STRATEGY'
        secret      // webhook security
      } = req.body;

      console.log('📨 TradingView Webhook received:', { action, symbol, quantity, price });

      // Verify webhook secret
      if (secret !== this.webhookSecret) {
        console.log('❌ Invalid webhook secret');
        return res.status(403).json({ error: 'Invalid secret' });
      }

      // Process the webhook
      let result;
      if (action === 'BUY' || action === 'SELL') {
        result = await this.openPosition({ action, symbol, quantity, price, timestamp, strategy });
      } else if (action === 'CLOSE') {
        result = await this.closePosition({ symbol, price, timestamp });
      }

      console.log('✅ Webhook processed successfully');
      res.json({ success: true, result });

    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 📈 Open Position from TradingView
  async openPosition({ action, symbol, quantity, price, timestamp, strategy }) {
    console.log(`📈 Opening ${action} position: ${symbol} @ $${price}`);

    // Get AI recommendation for this symbol
    const aiRecommendation = await this.getAIRecommendation(symbol);

    // Create trade data
    const tradeData = {
      symbol: symbol,
      name: `${symbol} Company`, // You could enhance this with real company names
      recommendation: action, // 'BUY' or 'SELL'
      confidence: aiRecommendation.confidence || 70,
      reasoning: [
        `TradingView ${strategy} signal`,
        `Auto-sync from paper trading`,
        ...aiRecommendation.reasoning?.slice(0, 3) || []
      ],
      currentPrice: price,
      priceChange: 0,
      priceChangePercent: 0,
      technicalData: aiRecommendation.technicalData || { rsi: null, trend: 'TRADINGVIEW', volumeRatio: null },
      newsData: { summary: { overallSentiment: 50 } },
      analysis: { 
        fundamentalScore: 50, 
        technicalScore: aiRecommendation.technicalScore || 50, 
        newsScore: 50, 
        overallScore: aiRecommendation.overallScore || 50 
      },
      source: 'TRADINGVIEW_WEBHOOK',
      // TradingView specific data
      tradingViewData: {
        strategy: strategy,
        originalAction: action,
        quantity: quantity,
        entryPrice: price,
        entryTime: timestamp,
        autoSynced: true
      }
    };

    // Log trade
    const tradeId = tradeLogger.logTrade(tradeData);

    // Store active position
    this.activePositions.set(symbol, {
      tradeId: tradeId,
      symbol: symbol,
      action: action,
      quantity: quantity,
      entryPrice: price,
      entryTime: timestamp,
      strategy: strategy
    });

    console.log(`📊 Position opened with Trade ID: ${tradeId}`);
    console.log(`🧠 AI recommendation included in trade data`);

    return {
      tradeId: tradeId,
      position: this.activePositions.get(symbol),
      aiRecommendation: aiRecommendation
    };
  }

  // 📉 Close Position from TradingView
  async closePosition({ symbol, price, timestamp }) {
    console.log(`📉 Closing position: ${symbol} @ $${price}`);

    const activePosition = this.activePositions.get(symbol);
    if (!activePosition) {
      throw new Error(`No active position found for ${symbol}`);
    }

    // Calculate profit/loss
    const entryPrice = activePosition.entryPrice;
    const isLong = activePosition.action === 'BUY';
    
    let profitLoss;
    if (isLong) {
      profitLoss = ((price - entryPrice) / entryPrice) * 100;
    } else {
      profitLoss = ((entryPrice - price) / entryPrice) * 100;
    }

    // Determine outcome
    const outcome = profitLoss > 0 ? 'WIN' : profitLoss < 0 ? 'LOSS' : 'NEUTRAL';

    // Calculate days held
    const entryTime = new Date(activePosition.entryTime);
    const closeTime = new Date(timestamp);
    const daysHeld = Math.max(1, Math.ceil((closeTime - entryTime) / (1000 * 60 * 60 * 24)));

    // Close the trade
    const result = {
      outcome: outcome,
      profitLoss: profitLoss,
      closePrice: price,
      daysHeld: daysHeld,
      notes: `Auto-closed via TradingView webhook. Strategy: ${activePosition.strategy}`
    };

    // Update trade result (this will trigger AI learning!)
    const updatedTrade = tradeLogger.updateTradeResult(activePosition.tradeId, result);

    // Trigger AI learning manually to ensure it happens
    console.log('🧠 Triggering AI learning from TradingView position close...');
    try {
      const tradeOutcome = {
        symbol: updatedTrade.symbol,
        originalRecommendation: updatedTrade.recommendation,
        originalConfidence: updatedTrade.confidence,
        actualOutcome: outcome,
        profitLoss: profitLoss,
        daysHeld: daysHeld,
        wasCorrect: outcome === 'WIN',
        technicalData: updatedTrade.technicalData,
        newsData: updatedTrade.newsData,
        tradingViewStrategy: activePosition.strategy
      };
      
      await aiLearningEngine.learnFromTrade(tradeOutcome);
      console.log(`📚 AI learned from TradingView trade: ${symbol} (${outcome})`);
      console.log(`✅ Total AI knowledge: ${aiLearningEngine.getTotalTrades ? aiLearningEngine.getTotalTrades() : 'Unknown'} trades`);
    } catch (aiError) {
      console.error('❌ AI learning from TradingView trade failed:', aiError.message);
    }

    // Remove from active positions
    this.activePositions.delete(symbol);

    console.log(`✅ Position closed: ${symbol} - ${outcome} (${profitLoss.toFixed(2)}%)`);

    return {
      closedTrade: updatedTrade,
      outcome: outcome,
      profitLoss: profitLoss,
      aiLearningTriggered: true
    };
  }

  // 🧠 Get AI Recommendation for Symbol
  async getAIRecommendation(symbol) {
    try {
      // This would ideally call your existing analysis function
      // For now, return a basic structure
      return {
        confidence: 70,
        reasoning: [`TradingView signal for ${symbol}`],
        technicalScore: 60,
        overallScore: 65,
        technicalData: { rsi: null, trend: 'NEUTRAL', volumeRatio: null }
      };
    } catch (error) {
      console.log(`⚠️ Could not get AI recommendation for ${symbol}: ${error.message}`);
      return {
        confidence: 50,
        reasoning: [`No AI data available for ${symbol}`],
        technicalScore: 50,
        overallScore: 50
      };
    }
  }

  // 📱 Manual Position Sync (for testing)
  async handleManualPositionSync(req, res) {
    try {
      const { positions } = req.body; // Array of positions from your paper trading

      let syncedCount = 0;
      for (const position of positions) {
        if (position.status === 'OPEN') {
          await this.openPosition(position);
          syncedCount++;
        } else if (position.status === 'CLOSED') {
          await this.closePosition(position);
          syncedCount++;
        }
      }

      res.json({
        success: true,
        message: `Synced ${syncedCount} positions`,
        activePositions: Array.from(this.activePositions.values())
      });

    } catch (error) {
      console.error('Manual sync error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // 📊 Get Active Positions
  async getActivePositions(req, res) {
    try {
      const positions = Array.from(this.activePositions.values());
      res.json({
        success: true,
        count: positions.length,
        positions: positions
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 🔄 Sync All Positions (called on startup)
  async syncExistingPositions() {
    try {
      // Get all pending trades from database
      const pendingTrades = tradeLogger.getPendingTrades();
      
      for (const trade of pendingTrades) {
        if (trade.tradingViewData) {
          this.activePositions.set(trade.symbol, {
            tradeId: trade.id,
            symbol: trade.symbol,
            action: trade.tradingViewData.originalAction,
            quantity: trade.tradingViewData.quantity,
            entryPrice: trade.tradingViewData.entryPrice,
            entryTime: trade.tradingViewData.entryTime,
            strategy: trade.tradingViewData.strategy
          });
        }
      }

      console.log(`🔄 Synced ${this.activePositions.size} existing TradingView positions`);
    } catch (error) {
      console.error('Position sync error:', error);
    }
  }
}

module.exports = new TradingViewIntegration();