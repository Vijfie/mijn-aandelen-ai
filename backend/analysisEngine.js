class AnalysisEngine {
  
  // Hoofdanalyse functie
  async analyzeStock(stockInfo, historicalData, technicalIndicators) {
    const fundamental = this.analyzeFundamentals(stockInfo);
    const technical = this.analyzeTechnical(technicalIndicators, stockInfo);
    const overall = this.combineAnalysis(fundamental, technical);
    
    return {
      symbol: stockInfo.symbol,
      name: stockInfo.name,
      currentPrice: stockInfo.price,
      priceChange: stockInfo.change,
      priceChangePercent: stockInfo.changePercent,
      fundamental: fundamental,
      technical: technical,
      overall: overall,
      recommendation: overall.recommendation,
      confidence: overall.confidence,
      reasoning: overall.reasoning
    };
  }

  // Fundamentele analyse
  analyzeFundamentals(stockInfo) {
    let score = 50; // Start neutraal
    const reasons = [];

    // P/E Ratio analyse
    if (stockInfo.pe !== null) {
      if (stockInfo.pe < 15) {
        score += 15;
        reasons.push(`Lage P/E ratio (${stockInfo.pe.toFixed(1)}) suggereert ondergewaardeerd`);
      } else if (stockInfo.pe > 30) {
        score -= 10;
        reasons.push(`Hoge P/E ratio (${stockInfo.pe.toFixed(1)}) suggereert mogelijk overgewaardeerd`);
      } else {
        score += 5;
        reasons.push(`Redelijke P/E ratio (${stockInfo.pe.toFixed(1)})`);
      }
    }

    // Beta analyse (volatiliteit)
    if (stockInfo.beta !== null) {
      if (stockInfo.beta < 1) {
        score += 5;
        reasons.push(`Lage volatiliteit (Beta: ${stockInfo.beta.toFixed(2)})`);
      } else if (stockInfo.beta > 1.5) {
        score -= 5;
        reasons.push(`Hoge volatiliteit (Beta: ${stockInfo.beta.toFixed(2)})`);
      }
    }

    // 52-week range analyse
    const currentPrice = stockInfo.price;
    const range52 = stockInfo.high52 - stockInfo.low52;
    const positionInRange = (currentPrice - stockInfo.low52) / range52;

    if (positionInRange < 0.3) {
      score += 10;
      reasons.push('Handelt dicht bij 52-week low (potentiële koop kans)');
    } else if (positionInRange > 0.8) {
      score -= 10;
      reasons.push('Handelt dicht bij 52-week high (mogelijk overgewaardeerd)');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      reasons: reasons,
      metrics: {
        pe: stockInfo.pe,
        beta: stockInfo.beta,
        positionIn52WeekRange: (positionInRange * 100).toFixed(1) + '%'
      }
    };
  }

  // Technische analyse
  analyzeTechnical(indicators, stockInfo) {
    if (!indicators) {
      return {
        score: 50,
        reasons: ['Onvoldoende data voor technische analyse'],
        signals: {}
      };
    }

    let score = 50;
    const reasons = [];
    const signals = {};

    // RSI analyse
    if (indicators.rsi !== null) {
      signals.rsi = indicators.rsi.toFixed(1);
      if (indicators.rsi < 30) {
        score += 15;
        reasons.push(`RSI toont oversold conditie (${indicators.rsi.toFixed(1)})`);
      } else if (indicators.rsi > 70) {
        score -= 15;
        reasons.push(`RSI toont overbought conditie (${indicators.rsi.toFixed(1)})`);
      } else if (indicators.rsi < 40) {
        score += 5;
        reasons.push(`RSI suggereert potentiële koop kans (${indicators.rsi.toFixed(1)})`);
      } else if (indicators.rsi > 60) {
        score -= 5;
        reasons.push(`RSI suggereert mogelijk overgewaardeerd (${indicators.rsi.toFixed(1)})`);
      }
    }

    // Moving Average analyse
    const currentPrice = stockInfo.price;
    if (indicators.sma20 && indicators.sma50) {
      signals.sma20 = indicators.sma20.toFixed(2);
      signals.sma50 = indicators.sma50.toFixed(2);
      
      if (currentPrice > indicators.sma20 && indicators.sma20 > indicators.sma50) {
        score += 10;
        reasons.push('Prijs boven moving averages (bullish trend)');
      } else if (currentPrice < indicators.sma20 && indicators.sma20 < indicators.sma50) {
        score -= 10;
        reasons.push('Prijs onder moving averages (bearish trend)');
      }
    }

    // Volume analyse
    if (indicators.volumeAvg && indicators.currentVolume) {
      const volumeRatio = indicators.currentVolume / indicators.volumeAvg;
      signals.volumeRatio = volumeRatio.toFixed(1);
      
      if (volumeRatio > 1.5) {
        score += 5;
        reasons.push('Hoog handelsvolume toont sterke interesse');
      } else if (volumeRatio < 0.5) {
        score -= 5;
        reasons.push('Laag handelsvolume toont weinig interesse');
      }
    }

    // Trend analyse
    signals.trend = indicators.trend;
    switch (indicators.trend) {
      case 'STRONG_UP':
        score += 15;
        reasons.push('Sterke opwaartse trend');
        break;
      case 'UP':
        score += 8;
        reasons.push('Opwaartse trend');
        break;
      case 'STRONG_DOWN':
        score -= 15;
        reasons.push('Sterke neerwaartse trend');
        break;
      case 'DOWN':
        score -= 8;
        reasons.push('Neerwaartse trend');
        break;
      default:
        reasons.push('Neutrale trend');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      reasons: reasons,
      signals: signals
    };
  }

  // Combineer fundamentele en technische analyse
  combineAnalysis(fundamental, technical) {
    // Gewogen gemiddelde (60% technical, 40% fundamental voor korte termijn)
    const combinedScore = (technical.score * 0.6) + (fundamental.score * 0.4);
    
    let recommendation;
    let confidence;
    
    if (combinedScore >= 70) {
      recommendation = 'BUY';
      confidence = Math.min(95, combinedScore + 10);
    } else if (combinedScore >= 55) {
      recommendation = 'HOLD';
      confidence = Math.max(60, combinedScore);
    } else {
      recommendation = 'SELL';
      confidence = Math.min(95, 100 - combinedScore + 10);
    }

    // Combineer redenen
    const allReasons = [
      ...fundamental.reasons.slice(0, 2), // Top 2 fundamentele redenen
      ...technical.reasons.slice(0, 3)    // Top 3 technische redenen
    ];

    return {
      score: combinedScore,
      recommendation: recommendation,
      confidence: Math.round(confidence),
      reasoning: allReasons
    };
  }
}

module.exports = new AnalysisEngine();