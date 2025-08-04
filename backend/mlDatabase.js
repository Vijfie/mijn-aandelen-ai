const fs = require('fs').promises;
const path = require('path');

class MLDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, 'ml_data.json');
    this.data = {
      predictions: [],
      performance: {
        totalPredictions: 0,
        correctPredictions: 0,
        accuracy: 0,
        confidenceCalibration: 1.0,
        stockPerformance: {}
      },
      learningHistory: []
    };
    this.loadData();
  }

  async loadData() {
    try {
      const fileData = await fs.readFile(this.dbPath, 'utf8');
      this.data = JSON.parse(fileData);
      console.log('📊 ML Database loaded:', {
        predictions: this.data.predictions.length,
        accuracy: `${(this.data.performance.accuracy * 100).toFixed(1)}%`
      });
    } catch (error) {
      console.log('📊 Creating new ML database...');
      await this.saveData();
    }
  }

  async saveData() {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving ML data:', error);
    }
  }

  async storePrediction(predictionData) {
    const prediction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      symbol: predictionData.symbol,
      recommendation: predictionData.recommendation,
      confidence: predictionData.confidence,
      price: predictionData.currentPrice,
      reasoning: predictionData.reasoning,
      technicalScore: predictionData.technicalScore,
      fundamentalScore: predictionData.fundamentalScore,
      newsScore: predictionData.newsScore,
      overallScore: predictionData.overallScore,
      // For tracking accuracy later
      evaluationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      isEvaluated: false,
      actualOutcome: null
    };

    this.data.predictions.push(prediction);
    this.data.performance.totalPredictions++;

    // Keep only last 1000 predictions
    if (this.data.predictions.length > 1000) {
      this.data.predictions = this.data.predictions.slice(-1000);
    }

    await this.saveData();
    console.log(`🤖 Stored prediction for ${predictionData.symbol}: ${predictionData.recommendation} (${predictionData.confidence}%)`);
    return prediction.id;
  }

  async evaluatePredictions() {
    const now = new Date();
    const pendingPredictions = this.data.predictions.filter(p => 
      !p.isEvaluated && new Date(p.evaluationDate) <= now
    );

    console.log(`🔍 Evaluating ${pendingPredictions.length} pending predictions...`);

    for (const prediction of pendingPredictions) {
      try {
        // Get current price (simplified - in real implementation you'd fetch real data)
        const currentPrice = await this.getCurrentPrice(prediction.symbol);
        const originalPrice = prediction.price;
        const priceChange = ((currentPrice - originalPrice) / originalPrice) * 100;

        // Determine if prediction was correct
        let isCorrect = false;
        if (prediction.recommendation === 'BUY' || prediction.recommendation === 'STRONG BUY') {
          isCorrect = priceChange > 2; // Stock went up more than 2%
        } else if (prediction.recommendation === 'SELL' || prediction.recommendation === 'STRONG SELL') {
          isCorrect = priceChange < -2; // Stock went down more than 2%
        } else if (prediction.recommendation === 'HOLD') {
          isCorrect = Math.abs(priceChange) <= 5; // Stock stayed relatively stable
        }

        // Update prediction
        prediction.isEvaluated = true;
        prediction.actualOutcome = {
          currentPrice: currentPrice,
          priceChange: priceChange,
          isCorrect: isCorrect,
          evaluatedAt: now.toISOString()
        };

        // Update performance metrics
        if (isCorrect) {
          this.data.performance.correctPredictions++;
        }

        console.log(`✅ Evaluated ${prediction.symbol}: ${isCorrect ? 'CORRECT' : 'INCORRECT'} (${priceChange.toFixed(2)}%)`);

      } catch (error) {
        console.error(`Error evaluating prediction for ${prediction.symbol}:`, error);
      }
    }

    // Recalculate accuracy
    this.data.performance.accuracy = this.data.performance.totalPredictions > 0 ? 
      this.data.performance.correctPredictions / this.data.performance.totalPredictions : 0;

    // Adjust confidence calibration based on performance
    this.adjustConfidenceCalibration();

    await this.saveData();
    
    if (pendingPredictions.length > 0) {
      console.log(`🎯 Updated ML Performance: ${(this.data.performance.accuracy * 100).toFixed(1)}% accuracy`);
    }
  }

  adjustConfidenceCalibration() {
    const accuracy = this.data.performance.accuracy;
    
    // If accuracy is low, reduce confidence
    if (accuracy < 0.6) {
      this.data.performance.confidenceCalibration = Math.max(0.7, this.data.performance.confidenceCalibration - 0.1);
    }
    // If accuracy is high, slightly increase confidence
    else if (accuracy > 0.8) {
      this.data.performance.confidenceCalibration = Math.min(1.2, this.data.performance.confidenceCalibration + 0.05);
    }
    
    console.log(`🎛️ Confidence calibration: ${this.data.performance.confidenceCalibration.toFixed(2)}`);
  }

  async getCurrentPrice(symbol) {
    // Simplified - return a random price change for demo
    // In real implementation, you'd fetch from Yahoo Finance
    const basePrice = 100 + Math.random() * 200;
    const change = (Math.random() - 0.5) * 20; // ±10% change
    return basePrice + change;
  }

  getPerformanceMetrics() {
    return {
      totalPredictions: this.data.performance.totalPredictions,
      correctPredictions: this.data.performance.correctPredictions,
      accuracy: this.data.performance.accuracy,
      accuracyPercent: (this.data.performance.accuracy * 100).toFixed(1),
      confidenceCalibration: this.data.performance.confidenceCalibration,
      recentPredictions: this.data.predictions.slice(-10).reverse()
    };
  }

  adjustConfidenceWithML(originalConfidence) {
    return Math.round(originalConfidence * this.data.performance.confidenceCalibration);
  }

  getStockSpecificPerformance(symbol) {
    const stockPredictions = this.data.predictions.filter(p => 
      p.symbol === symbol && p.isEvaluated
    );
    
    if (stockPredictions.length === 0) return null;
    
    const correct = stockPredictions.filter(p => p.actualOutcome.isCorrect).length;
    const accuracy = correct / stockPredictions.length;
    
    return {
      predictions: stockPredictions.length,
      accuracy: accuracy,
      accuracyPercent: (accuracy * 100).toFixed(1)
    };
  }
}

module.exports = new MLDatabase();