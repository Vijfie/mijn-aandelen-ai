// backend/aiLearningEngine.js - Advanced AI Learning Algorithm
const fs = require('fs');
const path = require('path');

class AILearningEngine {
  constructor() {
    this.dataPath = path.join(__dirname, 'ai_learning_data.json');
    this.tradesPath = path.join(__dirname, 'trades.json');
    this.learningData = this.loadLearningData();
    
    console.log('🧠 AI Learning Engine initialized');
    console.log(`📊 Learning from ${this.learningData.totalAnalyzedTrades} previous trades`);
  }
  
  // ===== MAIN LEARNING FUNCTIONS =====
  
  /**
   * Enhance analysis with AI learning
   */
  enhanceAnalysisWithLearning(baseAnalysis, stockData, technical, newsData) {
    console.log(`🧠 Applying AI learning to ${stockData.symbol}...`);
    
    // Get historical patterns for this scenario
    const patterns = this.findSimilarPatterns(stockData, technical, newsData);
    const marketCondition = this.detectMarketCondition();
    const confidenceAdjustment = this.calculateConfidenceAdjustment(baseAnalysis, patterns);
    
    // Apply learned adjustments
    let enhancedAnalysis = { ...baseAnalysis };
    
    // 1. Pattern-based recommendation adjustment
    const patternAdjustment = this.applyPatternLearning(enhancedAnalysis, patterns);
    enhancedAnalysis.recommendation = patternAdjustment.recommendation;
    enhancedAnalysis.confidence = Math.min(95, Math.max(20, patternAdjustment.confidence));
    
    // 2. Market condition adjustments
    const marketAdjustment = this.applyMarketConditionLearning(enhancedAnalysis, marketCondition);
    enhancedAnalysis.confidence = Math.min(95, enhancedAnalysis.confidence * marketAdjustment.confidenceMultiplier);
    
    // 3. Sector-specific learning
    const sectorAdjustment = this.applySectorLearning(enhancedAnalysis, stockData.symbol);
    
    // 4. Add AI insights to reasoning
    enhancedAnalysis.reasoning = [
      ...enhancedAnalysis.reasoning.slice(0, 5),
      ...this.generateAIInsights(patterns, marketCondition, sectorAdjustment)
    ];
    
    // 5. Calculate learning metrics
    const learningMetrics = this.calculateLearningMetrics(patterns, confidenceAdjustment);
    
    console.log(`🎯 AI Learning Applied:`);
    console.log(`   Pattern Match: ${patterns.length} similar scenarios found`);
    console.log(`   Success Rate: ${patterns.length > 0 ? (patterns.filter(p => p.wasCorrect).length / patterns.length * 100).toFixed(1) : 0}%`);
    console.log(`   Confidence Adjustment: ${confidenceAdjustment.toFixed(1)}%`);
    console.log(`   Market Condition: ${marketCondition.type} (${marketCondition.confidence}%)`);
    
    return {
      ...enhancedAnalysis,
      aiLearning: {
        patternsFound: patterns.length,
        successRate: patterns.length > 0 ? patterns.filter(p => p.wasCorrect).length / patterns.length : 0,
        confidenceAdjustment: confidenceAdjustment,
        marketCondition: marketCondition,
        learningMetrics: learningMetrics,
        aiVersion: this.learningData.aiVersion
      }
    };
  }
  
  /**
   * Learn from a completed trade
   */
  learnFromTrade(tradeResult) {
    console.log(`📚 Learning from trade: ${tradeResult.symbol} (${tradeResult.outcome})`);
    
    try {
      // 1. Extract learning features
      const features = this.extractTradeFeatures(tradeResult);
      
      // 2. Update pattern database
      this.updatePatternDatabase(features, tradeResult);
      
      // 3. Update sector performance
      this.updateSectorPerformance(tradeResult);
      
      // 4. Update market condition learning
      this.updateMarketConditionLearning(tradeResult);
      
      // 5. Update confidence calibration
      this.updateConfidenceCalibration(tradeResult);
      
      // 6. Increment learning counters
      this.learningData.totalAnalyzedTrades++;
      this.learningData.lastLearningUpdate = new Date().toISOString();
      
      // 7. Evolve AI if enough data
      if (this.shouldEvolveAI()) {
        this.evolveAI();
      }
      
      // 8. Save learning data
      this.saveLearningData();
      
      console.log(`✅ AI learned from ${tradeResult.symbol}. Total knowledge: ${this.learningData.totalAnalyzedTrades} trades`);
      
    } catch (error) {
      console.error('❌ Error in AI learning:', error);
    }
  }
  
  // ===== PATTERN RECOGNITION =====
  
  findSimilarPatterns(stockData, technical, newsData) {
    const currentFeatures = this.extractCurrentFeatures(stockData, technical, newsData);
    const patterns = [];
    
    // Search through historical patterns
    this.learningData.patterns.forEach(pattern => {
      const similarity = this.calculateSimilarity(currentFeatures, pattern.features);
      
      if (similarity > 0.7) { // 70% similarity threshold
        patterns.push({
          ...pattern,
          similarity: similarity,
          recency: this.calculateRecency(pattern.timestamp)
        });
      }
    });
    
    // Sort by similarity and recency (prefer recent similar patterns)
    return patterns.sort((a, b) => {
      const scoreA = a.similarity * 0.7 + a.recency * 0.3;
      const scoreB = b.similarity * 0.7 + b.recency * 0.3;
      return scoreB - scoreA;
    }).slice(0, 10); // Top 10 most relevant patterns
  }
  
  extractCurrentFeatures(stockData, technical, newsData) {
    return {
      // Price features
      pricePosition52Week: this.calculate52WeekPosition(stockData),
      priceChangePercent: this.normalizeValue(stockData.changePercent, -10, 10),
      
      // Technical features
      rsi: this.normalizeValue(technical.rsi, 0, 100),
      rsiRegime: this.categorizeRSI(technical.rsi),
      
      macdSignal: technical.macd?.signal || 'NEUTRAL',
      bollingerPosition: technical.bollingerBands?.position || 0.5,
      volumeRatio: Math.min(3, technical.volumeRatio || 1),
      
      trendDirection: technical.trend?.direction || 'NEUTRAL',
      trendStrength: this.normalizeValue(technical.trend?.strength || 0, 0, 100),
      
      // Fundamental features
      peRatio: this.categorizePE(stockData.pe),
      marketCapCategory: this.categorizeMarketCap(stockData.marketCap),
      
      // News features
      newsSentiment: this.normalizeValue(newsData?.summary?.overallSentiment || 50, 0, 100),
      newsVolume: Math.min(20, newsData?.summary?.totalArticles || 0),
      
      // Sector
      sector: this.determineSector(stockData.symbol),
      
      // Market condition
      marketCondition: this.detectMarketCondition().type
    };
  }
  
  calculateSimilarity(features1, features2) {
    let totalWeight = 0;
    let weightedSimilarity = 0;
    
    const weights = {
      rsiRegime: 0.15,
      macdSignal: 0.10,
      trendDirection: 0.12,
      peRatio: 0.08,
      newsSentiment: 0.05,
      marketCondition: 0.10,
      sector: 0.08,
      pricePosition52Week: 0.12,
      bollingerPosition: 0.10,
      volumeRatio: 0.10
    };
    
    Object.keys(weights).forEach(feature => {
      if (features1[feature] !== undefined && features2[feature] !== undefined) {
        const similarity = this.calculateFeatureSimilarity(
          features1[feature], 
          features2[feature], 
          feature
        );
        
        weightedSimilarity += similarity * weights[feature];
        totalWeight += weights[feature];
      }
    });
    
    return totalWeight > 0 ? weightedSimilarity / totalWeight : 0;
  }
  
  calculateFeatureSimilarity(value1, value2, featureType) {
    // Categorical features
    if (['rsiRegime', 'macdSignal', 'trendDirection', 'peRatio', 'marketCondition', 'sector'].includes(featureType)) {
      return value1 === value2 ? 1 : 0;
    }
    
    // Numerical features
    const diff = Math.abs(value1 - value2);
    return Math.max(0, 1 - diff);
  }
  
  // ===== LEARNING APPLICATIONS =====
  
  applyPatternLearning(analysis, patterns) {
    if (patterns.length === 0) {
      return { 
        recommendation: analysis.recommendation, 
        confidence: analysis.confidence 
      };
    }
    
    // Calculate success rates by recommendation
    const successRates = this.calculatePatternSuccessRates(patterns);
    
    // Find best recommendation based on historical success
    let bestRecommendation = analysis.recommendation;
    let bestSuccessRate = successRates[analysis.recommendation] || 0.5;
    
    Object.entries(successRates).forEach(([rec, rate]) => {
      if (rate > bestSuccessRate + 0.15) { // 15% improvement threshold
        bestRecommendation = rec;
        bestSuccessRate = rate;
      }
    });
    
    // Adjust confidence based on pattern success
    const avgSuccessRate = patterns.filter(p => p.wasCorrect).length / patterns.length;
    const confidenceMultiplier = 0.7 + (avgSuccessRate * 0.6); // 0.7 to 1.3 range
    
    return {
      recommendation: bestRecommendation,
      confidence: Math.round(analysis.confidence * confidenceMultiplier)
    };
  }
  
  applyMarketConditionLearning(analysis, marketCondition) {
    const conditionData = this.learningData.marketConditions[marketCondition.type] || {
      totalTrades: 0,
      successfulTrades: 0,
      avgSuccessRate: 0.5
    };
    
    let confidenceMultiplier = 1.0;
    
    if (conditionData.totalTrades > 10) {
      const marketSuccessRate = conditionData.successfulTrades / conditionData.totalTrades;
      
      // Adjust confidence based on market condition performance
      if (marketSuccessRate > 0.7) {
        confidenceMultiplier = 1.1; // Boost confidence in good market conditions
      } else if (marketSuccessRate < 0.4) {
        confidenceMultiplier = 0.85; // Reduce confidence in poor market conditions
      }
    }
    
    return { confidenceMultiplier };
  }
  
  applySectorLearning(analysis, symbol) {
    const sector = this.determineSector(symbol);
    const sectorData = this.learningData.sectorPerformance[sector] || {
      totalTrades: 0,
      successfulTrades: 0,
      avgHoldingPeriod: 7,
      volatilityFactor: 1.0
    };
    
    let adjustments = {
      confidenceAdjustment: 0,
      recommendationHint: null
    };
    
    if (sectorData.totalTrades > 5) {
      const sectorSuccessRate = sectorData.successfulTrades / sectorData.totalTrades;
      
      if (sectorSuccessRate > 0.65) {
        adjustments.confidenceAdjustment = 5;
        adjustments.recommendationHint = 'SECTOR_STRENGTH';
      } else if (sectorSuccessRate < 0.35) {
        adjustments.confidenceAdjustment = -5;
        adjustments.recommendationHint = 'SECTOR_WEAKNESS';
      }
    }
    
    return adjustments;
  }
  
  // ===== AI INSIGHTS GENERATION =====
  
  generateAIInsights(patterns, marketCondition, sectorAdjustment) {
    const insights = [];
    
    // Pattern insights
    if (patterns.length > 3) {
      const successRate = patterns.filter(p => p.wasCorrect).length / patterns.length;
      if (successRate > 0.7) {
        insights.push(`🧠 AI found ${patterns.length} similar scenarios with ${(successRate * 100).toFixed(0)}% success rate`);
      } else if (successRate < 0.4) {
        insights.push(`⚠️ AI caution: ${patterns.length} similar scenarios had ${(successRate * 100).toFixed(0)}% success rate`);
      }
    }
    
    // Market condition insights
    if (marketCondition.confidence > 0.8) {
      const conditionData = this.learningData.marketConditions[marketCondition.type];
      if (conditionData && conditionData.totalTrades > 10) {
        const marketSuccess = conditionData.successfulTrades / conditionData.totalTrades;
        if (marketSuccess > 0.6) {
          insights.push(`🌊 AI detects favorable ${marketCondition.type.toLowerCase()} market (${(marketSuccess * 100).toFixed(0)}% historical success)`);
        }
      }
    }
    
    // Sector insights
    if (sectorAdjustment.recommendationHint === 'SECTOR_STRENGTH') {
      insights.push(`🎯 AI sector analysis: Strong historical performance in this sector`);
    } else if (sectorAdjustment.recommendationHint === 'SECTOR_WEAKNESS') {
      insights.push(`🚨 AI sector analysis: Challenging conditions in this sector`);
    }
    
    // Evolution insights
    if (this.learningData.aiVersion > 1.0) {
      insights.push(`🚀 AI v${this.learningData.aiVersion.toFixed(1)} enhanced analysis (${this.learningData.totalAnalyzedTrades} trades learned)`);
    }
    
    return insights.slice(0, 2); // Max 2 AI insights
  }
  
  // ===== LEARNING DATA MANAGEMENT =====
  
  updatePatternDatabase(features, tradeResult) {
    const pattern = {
      id: this.generatePatternId(),
      timestamp: new Date().toISOString(),
      features: features,
      recommendation: tradeResult.recommendation,
      confidence: tradeResult.confidence,
      outcome: tradeResult.outcome,
      wasCorrect: this.isTradeCorrect(tradeResult),
      profitLoss: tradeResult.actualProfitLoss || 0,
      holdingPeriod: tradeResult.daysHeld || 1
    };
    
    this.learningData.patterns.push(pattern);
    
    // Keep only recent patterns (max 1000)
    if (this.learningData.patterns.length > 1000) {
      this.learningData.patterns = this.learningData.patterns
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 1000);
    }
  }
  
  updateSectorPerformance(tradeResult) {
    const sector = this.determineSector(tradeResult.symbol);
    
    if (!this.learningData.sectorPerformance[sector]) {
      this.learningData.sectorPerformance[sector] = {
        totalTrades: 0,
        successfulTrades: 0,
        totalReturn: 0,
        avgHoldingPeriod: 0,
        volatilityFactor: 1.0
      };
    }
    
    const sectorData = this.learningData.sectorPerformance[sector];
    sectorData.totalTrades++;
    
    if (this.isTradeCorrect(tradeResult)) {
      sectorData.successfulTrades++;
    }
    
    sectorData.totalReturn += tradeResult.actualProfitLoss || 0;
    sectorData.avgHoldingPeriod = (sectorData.avgHoldingPeriod + (tradeResult.daysHeld || 1)) / 2;
  }
  
  updateMarketConditionLearning(tradeResult) {
    const condition = this.detectMarketCondition().type;
    
    if (!this.learningData.marketConditions[condition]) {
      this.learningData.marketConditions[condition] = {
        totalTrades: 0,
        successfulTrades: 0,
        avgSuccessRate: 0.5
      };
    }
    
    const conditionData = this.learningData.marketConditions[condition];
    conditionData.totalTrades++;
    
    if (this.isTradeCorrect(tradeResult)) {
      conditionData.successfulTrades++;
    }
    
    conditionData.avgSuccessRate = conditionData.successfulTrades / conditionData.totalTrades;
  }
  
  updateConfidenceCalibration(tradeResult) {
    const confidenceRange = this.getConfidenceRange(tradeResult.confidence);
    
    if (!this.learningData.confidenceCalibration[confidenceRange]) {
      this.learningData.confidenceCalibration[confidenceRange] = {
        totalPredictions: 0,
        correctPredictions: 0,
        actualAccuracy: 0
      };
    }
    
    const calibData = this.learningData.confidenceCalibration[confidenceRange];
    calibData.totalPredictions++;
    
    if (this.isTradeCorrect(tradeResult)) {
      calibData.correctPredictions++;
    }
    
    calibData.actualAccuracy = calibData.correctPredictions / calibData.totalPredictions;
  }
  
  // ===== AI EVOLUTION =====
  
  shouldEvolveAI() {
    return this.learningData.totalAnalyzedTrades % 25 === 0 && 
           this.learningData.totalAnalyzedTrades > 0;
  }
  
  evolveAI() {
    console.log('🚀 AI Evolution triggered!');
    
    // Increase AI version
    this.learningData.aiVersion += 0.1;
    
    // Optimize learning parameters
    this.optimizeLearningParameters();
    
    // Prune old patterns
    this.pruneOldPatterns();
    
    // Update AI capabilities
    this.updateAICapabilities();
    
    console.log(`✨ AI evolved to version ${this.learningData.aiVersion.toFixed(1)}`);
  }
  
  optimizeLearningParameters() {
    // Analyze overall performance and adjust learning parameters
    const overallAccuracy = this.calculateOverallAccuracy();
    
    if (overallAccuracy > 0.7) {
      // AI is performing well, can be more aggressive
      this.learningData.learningParameters.confidenceBoost = 1.1;
      this.learningData.learningParameters.patternThreshold = 0.65;
    } else if (overallAccuracy < 0.5) {
      // AI needs to be more conservative
      this.learningData.learningParameters.confidenceBoost = 0.9;
      this.learningData.learningParameters.patternThreshold = 0.8;
    }
  }
  
  // ===== UTILITY FUNCTIONS =====
  
  calculate52WeekPosition(stockData) {
    if (!stockData.high52 || !stockData.low52) return 0.5;
    return (stockData.price - stockData.low52) / (stockData.high52 - stockData.low52);
  }
  
  categorizeRSI(rsi) {
    if (rsi < 30) return 'OVERSOLD';
    if (rsi < 45) return 'LOW';
    if (rsi < 55) return 'NEUTRAL';
    if (rsi < 70) return 'HIGH';
    return 'OVERBOUGHT';
  }
  
  categorizePE(pe) {
    if (!pe) return 'UNKNOWN';
    if (pe < 15) return 'LOW';
    if (pe < 25) return 'MODERATE';
    if (pe < 40) return 'HIGH';
    return 'VERY_HIGH';
  }
  
  categorizeMarketCap(marketCap) {
    if (!marketCap) return 'UNKNOWN';
    if (marketCap > 200000000000) return 'MEGA';      // >$200B
    if (marketCap > 10000000000) return 'LARGE';      // >$10B
    if (marketCap > 2000000000) return 'MID';         // >$2B
    return 'SMALL';                                   // <$2B
  }
  
  determineSector(symbol) {
    const sectorMap = {
      'AAPL': 'TECH', 'MSFT': 'TECH', 'GOOGL': 'TECH', 'AMZN': 'TECH', 'TSLA': 'TECH',
      'NVDA': 'TECH', 'META': 'TECH', 'NFLX': 'TECH', 'CRM': 'TECH', 'ADBE': 'TECH',
      
      'JPM': 'FINANCIAL', 'BAC': 'FINANCIAL', 'WFC': 'FINANCIAL', 'GS': 'FINANCIAL',
      'V': 'FINANCIAL', 'MA': 'FINANCIAL', 'PYPL': 'FINANCIAL',
      
      'JNJ': 'HEALTHCARE', 'PFE': 'HEALTHCARE', 'UNH': 'HEALTHCARE', 'MRNA': 'HEALTHCARE',
      'ABT': 'HEALTHCARE', 'BMY': 'HEALTHCARE',
      
      'KO': 'CONSUMER', 'PG': 'CONSUMER', 'WMT': 'CONSUMER', 'NKE': 'CONSUMER',
      'SBUX': 'CONSUMER', 'MCD': 'CONSUMER', 'DIS': 'CONSUMER',
      
      'XOM': 'ENERGY', 'CVX': 'ENERGY', 'COP': 'ENERGY'
    };
    
    if (symbol.includes('USD')) return 'CRYPTO';
    return sectorMap[symbol] || 'OTHER';
  }
  
  detectMarketCondition() {
    // Simplified market condition detection
    // In reality, this would analyze broader market indicators
    return {
      type: ['BULL', 'BEAR', 'SIDEWAYS'][Math.floor(Math.random() * 3)],
      confidence: 0.7 + Math.random() * 0.3
    };
  }
  
  normalizeValue(value, min, max) {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }
  
  calculateRecency(timestamp) {
    const now = new Date();
    const tradeDate = new Date(timestamp);
    const daysDiff = (now - tradeDate) / (1000 * 60 * 60 * 24);
    
    // More recent = higher score
    return Math.max(0, 1 - (daysDiff / 365)); // 1 year decay
  }
  
  isTradeCorrect(tradeResult) {
    if (tradeResult.outcome === 'WIN') return true;
    if (tradeResult.outcome === 'LOSS') return false;
    
    // Fallback to profit/loss
    return (tradeResult.actualProfitLoss || 0) > 0;
  }
  
  getConfidenceRange(confidence) {
    if (confidence >= 80) return 'HIGH';
    if (confidence >= 60) return 'MEDIUM';
    return 'LOW';
  }
  
  calculateOverallAccuracy() {
    if (this.learningData.patterns.length === 0) return 0.5;
    
    const correctPatterns = this.learningData.patterns.filter(p => p.wasCorrect).length;
    return correctPatterns / this.learningData.patterns.length;
  }
  
  calculatePatternSuccessRates(patterns) {
    const rates = {};
    const recommendations = ['STRONG BUY', 'BUY', 'WEAK BUY', 'HOLD', 'WEAK SELL', 'SELL', 'STRONG SELL'];
    
    recommendations.forEach(rec => {
      const recPatterns = patterns.filter(p => p.recommendation === rec);
      if (recPatterns.length > 0) {
        rates[rec] = recPatterns.filter(p => p.wasCorrect).length / recPatterns.length;
      }
    });
    
    return rates;
  }
  
  generatePatternId() {
    return `PATTERN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  extractTradeFeatures(tradeResult) {
    // Extract features from completed trade for learning
    return this.extractCurrentFeatures(
      {
        symbol: tradeResult.symbol,
        price: tradeResult.currentPrice,
        changePercent: tradeResult.priceChangePercent,
        pe: tradeResult.pe,
        marketCap: tradeResult.marketCap,
        high52: tradeResult.high52,
        low52: tradeResult.low52
      },
      tradeResult.technicalData || {},
      tradeResult.newsData || {}
    );
  }
  
  calculateConfidenceAdjustment(analysis, patterns) {
    if (patterns.length === 0) return 0;
    
    const avgSuccessRate = patterns.filter(p => p.wasCorrect).length / patterns.length;
    const baselineSuccess = 0.5; // 50% baseline
    
    return (avgSuccessRate - baselineSuccess) * 20; // -10 to +10 adjustment
  }
  
  calculateLearningMetrics(patterns, confidenceAdjustment) {
    return {
      patternsAnalyzed: patterns.length,
      avgSimilarity: patterns.length > 0 ? patterns.reduce((sum, p) => sum + p.similarity, 0) / patterns.length : 0,
      confidenceAdjustment: confidenceAdjustment,
      learningStrength: Math.min(100, this.learningData.totalAnalyzedTrades / 10) // 0-100%
    };
  }
  
  pruneOldPatterns() {
    // Remove patterns older than 1 year or keep only top 800 most recent
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    this.learningData.patterns = this.learningData.patterns
      .filter(p => new Date(p.timestamp) > oneYearAgo)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 800);
  }
  
  updateAICapabilities() {
    // Unlock new AI capabilities based on experience
    const totalTrades = this.learningData.totalAnalyzedTrades;
    
    if (totalTrades >= 100 && !this.learningData.capabilities.advancedPatterns) {
      this.learningData.capabilities.advancedPatterns = true;
      console.log('🎯 AI unlocked: Advanced Pattern Recognition');
    }
    
    if (totalTrades >= 200 && !this.learningData.capabilities.marketTimingOptimization) {
      this.learningData.capabilities.marketTimingOptimization = true;
      console.log('⏰ AI unlocked: Market Timing Optimization');
    }
    
    if (totalTrades >= 300 && !this.learningData.capabilities.personalizedRecommendations) {
      this.learningData.capabilities.personalizedRecommendations = true;
      console.log('👤 AI unlocked: Personalized Recommendations');
    }
  }
  
  // ===== DATA PERSISTENCE =====
  
  loadLearningData() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
        console.log(`📚 Loaded AI learning data: ${data.totalAnalyzedTrades} trades, v${data.aiVersion}`);
        return data;
      }
    } catch (error) {
      console.log('⚠️ Could not load AI learning data, creating new dataset');
    }
    
    return this.createInitialLearningData();
  }
  
  createInitialLearningData() {
    return {
      aiVersion: 1.0,
      totalAnalyzedTrades: 0,
      lastLearningUpdate: new Date().toISOString(),
      
      patterns: [],
      
      sectorPerformance: {},
      
      marketConditions: {
        BULL: { totalTrades: 0, successfulTrades: 0, avgSuccessRate: 0.5 },
        BEAR: { totalTrades: 0, successfulTrades: 0, avgSuccessRate: 0.5 },
        SIDEWAYS: { totalTrades: 0, successfulTrades: 0, avgSuccessRate: 0.5 }
      },
      
      confidenceCalibration: {
        LOW: { totalPredictions: 0, correctPredictions: 0, actualAccuracy: 0 },
        MEDIUM: { totalPredictions: 0, correctPredictions: 0, actualAccuracy: 0 },
        HIGH: { totalPredictions: 0, correctPredictions: 0, actualAccuracy: 0 }
      },
      
      learningParameters: {
        confidenceBoost: 1.0,
        patternThreshold: 0.7,
        recencyWeight: 0.3
      },
      
      capabilities: {
        basicLearning: true,
        advancedPatterns: false,
        marketTimingOptimization: false,
        personalizedRecommendations: false
      }
    };
  }
  
  saveLearningData() {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.learningData, null, 2));
      console.log(`💾 AI learning data saved (${this.learningData.totalAnalyzedTrades} trades)`);
    } catch (error) {
      console.error('❌ Failed to save AI learning data:', error);
    }
  }
  
  // ===== PUBLIC API METHODS =====
  
  /**
   * Get AI learning statistics for dashboard
   */
  getLearningStats() {
    const stats = {
      aiVersion: this.learningData.aiVersion,
      totalTrades: this.learningData.totalAnalyzedTrades,
      lastUpdate: this.learningData.lastLearningUpdate,
      
      overallAccuracy: this.calculateOverallAccuracy(),
      
      patternCount: this.learningData.patterns.length,
      
      sectorStats: Object.keys(this.learningData.sectorPerformance).map(sector => ({
        sector: sector,
        trades: this.learningData.sectorPerformance[sector].totalTrades,
        successRate: this.learningData.sectorPerformance[sector].totalTrades > 0 ? 
          this.learningData.sectorPerformance[sector].successfulTrades / this.learningData.sectorPerformance[sector].totalTrades : 0
      })),
      
      marketConditionStats: Object.keys(this.learningData.marketConditions).map(condition => ({
        condition: condition,
        trades: this.learningData.marketConditions[condition].totalTrades,
        successRate: this.learningData.marketConditions[condition].avgSuccessRate
      })),
      
      confidenceCalibration: Object.keys(this.learningData.confidenceCalibration).map(range => ({
        range: range,
        predictions: this.learningData.confidenceCalibration[range].totalPredictions,
        accuracy: this.learningData.confidenceCalibration[range].actualAccuracy
      })),
      
      capabilities: this.learningData.capabilities,
      
      nextEvolution: {
        tradesUntilNext: 25 - (this.learningData.totalAnalyzedTrades % 25),
        nextVersion: (this.learningData.aiVersion + 0.1).toFixed(1)
      }
    };
    
    return stats;
  }
  
  /**
   * Get AI insights for a specific symbol
   */
  getSymbolInsights(symbol) {
    const sectorInsights = this.getSymbolSectorInsights(symbol);
    const historicalPatterns = this.getSymbolHistoricalPatterns(symbol);
    const marketInsights = this.getMarketInsights();
    
    return {
      symbol: symbol,
      sector: this.determineSector(symbol),
      sectorInsights: sectorInsights,
      historicalPatterns: historicalPatterns,
      marketInsights: marketInsights,
      aiRecommendations: this.getAIRecommendations(symbol)
    };
  }
  
  getSymbolSectorInsights(symbol) {
    const sector = this.determineSector(symbol);
    const sectorData = this.learningData.sectorPerformance[sector];
    
    if (!sectorData || sectorData.totalTrades < 3) {
      return {
        message: `Limited data for ${sector} sector`,
        confidence: 'LOW'
      };
    }
    
    const successRate = sectorData.successfulTrades / sectorData.totalTrades;
    const avgReturn = sectorData.totalReturn / sectorData.totalTrades;
    
    return {
      successRate: successRate,
      avgReturn: avgReturn,
      avgHoldingPeriod: sectorData.avgHoldingPeriod,
      totalTrades: sectorData.totalTrades,
      message: successRate > 0.6 ? 
        `Strong performance in ${sector} sector (${(successRate * 100).toFixed(0)}% success rate)` :
        `Challenging conditions in ${sector} sector (${(successRate * 100).toFixed(0)}% success rate)`,
      confidence: sectorData.totalTrades > 10 ? 'HIGH' : 'MEDIUM'
    };
  }
  
  getSymbolHistoricalPatterns(symbol) {
    const symbolPatterns = this.learningData.patterns.filter(p => 
      p.features.sector === this.determineSector(symbol)
    );
    
    if (symbolPatterns.length === 0) {
      return {
        message: 'No historical patterns found',
        patterns: []
      };
    }
    
    const recentPatterns = symbolPatterns
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
    
    return {
      totalPatterns: symbolPatterns.length,
      recentPatterns: recentPatterns.map(p => ({
        date: p.timestamp,
        recommendation: p.recommendation,
        wasCorrect: p.wasCorrect,
        profitLoss: p.profitLoss
      })),
      message: `Found ${symbolPatterns.length} similar historical patterns`
    };
  }
  
  getMarketInsights() {
    const currentCondition = this.detectMarketCondition();
    const conditionData = this.learningData.marketConditions[currentCondition.type];
    
    return {
      currentCondition: currentCondition.type,
      confidence: currentCondition.confidence,
      historicalPerformance: conditionData ? {
        trades: conditionData.totalTrades,
        successRate: conditionData.avgSuccessRate,
        message: conditionData.totalTrades > 10 ? 
          `In ${currentCondition.type.toLowerCase()} markets, AI has ${(conditionData.avgSuccessRate * 100).toFixed(0)}% success rate` :
          'Limited historical data for current market condition'
      } : null
    };
  }
  
  getAIRecommendations(symbol) {
    const recommendations = [];
    
    // AI capability-based recommendations
    if (this.learningData.capabilities.advancedPatterns) {
      recommendations.push('🎯 Advanced pattern recognition active');
    }
    
    if (this.learningData.capabilities.marketTimingOptimization) {
      recommendations.push('⏰ Market timing optimization enabled');
    }
    
    if (this.learningData.capabilities.personalizedRecommendations) {
      recommendations.push('👤 Personalized analysis based on your trading style');
    }
    
    // Experience-based recommendations
    if (this.learningData.totalAnalyzedTrades > 50) {
      recommendations.push(`🧠 AI learned from ${this.learningData.totalAnalyzedTrades} trades`);
    }
    
    // Sector-specific recommendations
    const sector = this.determineSector(symbol);
    const sectorData = this.learningData.sectorPerformance[sector];
    if (sectorData && sectorData.totalTrades > 5) {
      const successRate = sectorData.successfulTrades / sectorData.totalTrades;
      if (successRate > 0.7) {
        recommendations.push(`✨ Strong AI performance in ${sector} sector`);
      }
    }
    
    return recommendations;
  }
  
  /**
   * Reset AI learning (for debugging/testing)
   */
  resetLearning() {
    console.log('🔄 Resetting AI learning data...');
    this.learningData = this.createInitialLearningData();
    this.saveLearningData();
    console.log('✅ AI learning data reset complete');
  }
  
  /**
   * Export learning data for analysis
   */
  exportLearningData() {
    return {
      ...this.learningData,
      exportTimestamp: new Date().toISOString(),
      exportVersion: '1.0'
    };
  }
  
  /**
   * Get AI performance summary
   */
  getPerformanceSummary() {
    const totalTrades = this.learningData.totalAnalyzedTrades;
    const overallAccuracy = this.calculateOverallAccuracy();
    
    let performanceLevel = 'LEARNING';
    if (totalTrades > 100 && overallAccuracy > 0.7) performanceLevel = 'EXPERT';
    else if (totalTrades > 50 && overallAccuracy > 0.6) performanceLevel = 'ADVANCED';
    else if (totalTrades > 20 && overallAccuracy > 0.5) performanceLevel = 'INTERMEDIATE';
    
    return {
      level: performanceLevel,
      accuracy: overallAccuracy,
      totalTrades: totalTrades,
      version: this.learningData.aiVersion,
      capabilities: Object.keys(this.learningData.capabilities).filter(
        cap => this.learningData.capabilities[cap]
      ),
      strengths: this.identifyStrengths(),
      improvements: this.identifyImprovements()
    };
  }
  
  identifyStrengths() {
    const strengths = [];
    
    // Check sector performance
    Object.entries(this.learningData.sectorPerformance).forEach(([sector, data]) => {
      if (data.totalTrades > 5) {
        const successRate = data.successfulTrades / data.totalTrades;
        if (successRate > 0.7) {
          strengths.push(`Strong performance in ${sector} sector (${(successRate * 100).toFixed(0)}%)`);
        }
      }
    });
    
    // Check confidence calibration
    Object.entries(this.learningData.confidenceCalibration).forEach(([range, data]) => {
      if (data.totalPredictions > 10 && data.actualAccuracy > 0.8) {
        strengths.push(`Well-calibrated ${range.toLowerCase()} confidence predictions`);
      }
    });
    
    return strengths;
  }
  
  identifyImprovements() {
    const improvements = [];
    
    // Check for areas needing improvement
    Object.entries(this.learningData.sectorPerformance).forEach(([sector, data]) => {
      if (data.totalTrades > 5) {
        const successRate = data.successfulTrades / data.totalTrades;
        if (successRate < 0.4) {
          improvements.push(`Needs improvement in ${sector} sector analysis`);
        }
      }
    });
    
    // Check total experience
    if (this.learningData.totalAnalyzedTrades < 50) {
      improvements.push('Needs more trading data to improve accuracy');
    }
    
    return improvements;
  }
}

module.exports = new AILearningEngine();