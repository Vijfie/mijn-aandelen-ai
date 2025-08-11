// backend/riskManager.js
class RiskManager {
  constructor() {
    this.riskProfiles = {
      CONSERVATIVE: {
        stopLossPercent: 3,
        takeProfitPercent: 6,
        riskRewardRatio: 2,
        maxPositionSize: 0.05, // 5% van portfolio
        holdingPeriod: '1-3 maanden'
      },
      MODERATE: {
        stopLossPercent: 5,
        takeProfitPercent: 12,
        riskRewardRatio: 2.4,
        maxPositionSize: 0.08, // 8% van portfolio
        holdingPeriod: '2-8 weken'
      },
      AGGRESSIVE: {
        stopLossPercent: 8,
        takeProfitPercent: 20,
        riskRewardRatio: 2.5,
        maxPositionSize: 0.12, // 12% van portfolio
        holdingPeriod: '1-4 weken'
      }
    };
  }

  // Hoofdfunctie voor risk management berekening
  calculateRiskManagement(stockInfo, technical, recommendation, confidence) {
    const riskProfile = this.determineRiskProfile(recommendation, confidence, technical);
    const currentPrice = stockInfo.price;
    
    // Bereken stop loss en take profit
    const stopLoss = this.calculateStopLoss(currentPrice, technical, riskProfile);
    const takeProfit = this.calculateTakeProfit(currentPrice, technical, riskProfile);
    const positionSize = this.calculatePositionSize(riskProfile, confidence);
    const holdingPeriod = this.calculateHoldingPeriod(technical, riskProfile);
    const riskReward = this.calculateRiskReward(currentPrice, stopLoss.price, takeProfit.price);

    return {
      riskProfile: riskProfile,
      currentPrice: currentPrice,
      stopLoss: stopLoss,
      takeProfit: takeProfit,
      positionSize: positionSize,
      holdingPeriod: holdingPeriod,
      riskReward: riskReward,
      maxLoss: this.calculateMaxLoss(currentPrice, stopLoss.price, positionSize.percentage),
      expectedGain: this.calculateExpectedGain(currentPrice, takeProfit.price, positionSize.percentage),
      exitStrategy: this.generateExitStrategy(technical, confidence)
    };
  }

  // Bepaal risicoprofiel op basis van marktcondities
  determineRiskProfile(recommendation, confidence, technical) {
    const rsi = parseFloat(technical.rsi) || 50;
    const trend = technical.trend;
    
    // Hoge confidence + sterke trend = agressiever
    if (confidence >= 80 && (trend === 'STRONG_UP' || trend === 'UP') && rsi < 60) {
      return 'AGGRESSIVE';
    }
    
    // Gemiddelde confidence of neutrale markt
    if (confidence >= 65 && trend !== 'STRONG_DOWN' && rsi < 70) {
      return 'MODERATE';
    }
    
    // Lage confidence of bearish markt = conservatief
    return 'CONSERVATIVE';
  }

  // Bereken stop loss op basis van technische analyse
  calculateStopLoss(currentPrice, technical, riskProfile) {
    const profile = this.riskProfiles[riskProfile];
    let stopLossPercent = profile.stopLossPercent;
    
    // Aanpassingen op basis van volatiliteit en trend
    const rsi = parseFloat(technical.rsi) || 50;
    
    // Bij overbought condities: tighter stop loss
    if (rsi > 70) {
      stopLossPercent *= 0.8;
    }
    
    // Bij oversold condities: looser stop loss
    if (rsi < 30) {
      stopLossPercent *= 1.2;
    }
    
    // Trend-based aanpassingen
    if (technical.trend === 'STRONG_UP') {
      stopLossPercent *= 0.9; // Tighter stop in sterke uptrend
    } else if (technical.trend === 'DOWN' || technical.trend === 'STRONG_DOWN') {
      stopLossPercent *= 1.3; // Looser stop in downtrend
    }

    const stopLossPrice = currentPrice * (1 - stopLossPercent / 100);
    
    return {
      price: Number(stopLossPrice.toFixed(2)),
      percentage: Number(stopLossPercent.toFixed(1)),
      reasoning: this.getStopLossReasoning(riskProfile, technical, stopLossPercent)
    };
  }

  // Bereken take profit targets
  calculateTakeProfit(currentPrice, technical, riskProfile) {
    const profile = this.riskProfiles[riskProfile];
    let takeProfitPercent = profile.takeProfitPercent;
    
    const rsi = parseFloat(technical.rsi) || 50;
    
    // Aanpassingen op basis van marktcondities
    if (technical.trend === 'STRONG_UP' && rsi < 50) {
      takeProfitPercent *= 1.3; // Hogere target in sterke uptrend
    } else if (rsi > 60) {
      takeProfitPercent *= 0.8; // Lagere target bij overbought
    }

    const primaryTarget = currentPrice * (1 + takeProfitPercent / 100);
    const secondaryTarget = currentPrice * (1 + (takeProfitPercent * 1.5) / 100);
    
    return {
      primary: {
        price: Number(primaryTarget.toFixed(2)),
        percentage: Number(takeProfitPercent.toFixed(1)),
        allocation: '70%' // Verkoop 70% van positie bij eerste target
      },
      secondary: {
        price: Number(secondaryTarget.toFixed(2)),
        percentage: Number((takeProfitPercent * 1.5).toFixed(1)),
        allocation: '30%' // Resterende 30% bij tweede target
      },
      reasoning: this.getTakeProfitReasoning(riskProfile, technical, takeProfitPercent)
    };
  }

  // Bereken optimale positiegrootte
  calculatePositionSize(riskProfile, confidence) {
    const profile = this.riskProfiles[riskProfile];
    let baseSize = profile.maxPositionSize;
    
    // Aanpassing op basis van confidence
    const confidenceMultiplier = confidence / 100;
    const adjustedSize = baseSize * confidenceMultiplier;
    
    return {
      percentage: Number((adjustedSize * 100).toFixed(1)),
      reasoning: `Gebaseerd op ${riskProfile.toLowerCase()} profiel en ${confidence}% confidence`
    };
  }

  // Bereken verwachte holding period
  calculateHoldingPeriod(technical, riskProfile) {
    const profile = this.riskProfiles[riskProfile];
    let basePeriod = profile.holdingPeriod;
    
    // Aanpassingen op basis van technische condities
    const rsi = parseFloat(technical.rsi) || 50;
    let adjustment = '';
    
    if (technical.trend === 'STRONG_UP' && rsi < 40) {
      adjustment = ' (mogelijk langer bij sterke momentum)';
    } else if (rsi > 75) {
      adjustment = ' (mogelijk korter bij overbought condities)';
    }
    
    return {
      period: basePeriod + adjustment,
      signals: this.getHoldingPeriodSignals(technical)
    };
  }

  // Bereken risk/reward ratio
  calculateRiskReward(currentPrice, stopLoss, takeProfit) {
    const risk = currentPrice - stopLoss;
    const reward = takeProfit - currentPrice;
    const ratio = reward / risk;
    
    return {
      ratio: Number(ratio.toFixed(2)),
      risk: Number(risk.toFixed(2)),
      reward: Number(reward.toFixed(2)),
      quality: ratio >= 2 ? 'EXCELLENT' : ratio >= 1.5 ? 'GOOD' : 'POOR'
    };
  }

  // Bereken maximum verlies
  calculateMaxLoss(currentPrice, stopLoss, positionSizePercent) {
    const lossPerShare = currentPrice - stopLoss;
    const lossPercent = (lossPerShare / currentPrice) * 100;
    const portfolioImpact = (lossPercent * positionSizePercent) / 100;
    
    return {
      perShare: Number(lossPerShare.toFixed(2)),
      percentage: Number(lossPercent.toFixed(2)),
      portfolioImpact: Number(portfolioImpact.toFixed(2))
    };
  }

  // Bereken verwachte winst
  calculateExpectedGain(currentPrice, takeProfit, positionSizePercent) {
    const gainPerShare = takeProfit - currentPrice;
    const gainPercent = (gainPerShare / currentPrice) * 100;
    const portfolioImpact = (gainPercent * positionSizePercent) / 100;
    
    return {
      perShare: Number(gainPerShare.toFixed(2)),
      percentage: Number(gainPercent.toFixed(2)),
      portfolioImpact: Number(portfolioImpact.toFixed(2))
    };
  }

  // Genereer exit strategy
  generateExitStrategy(technical, confidence) {
    const strategies = [];
    
    // Hoofdstrategie op basis van confidence
    if (confidence >= 80) {
      strategies.push('Houd positie tot primaire take profit target');
      strategies.push('Overweeg trailing stop loss na 50% van target bereikt');
    } else if (confidence >= 65) {
      strategies.push('Verkoop 50% bij primaire target, houd rest');
      strategies.push('Zet stop loss naar break-even na 30% winst');
    } else {
      strategies.push('Neem winst vroeg bij 8-10% gain');
      strategies.push('Gebruik tight stop loss management');
    }
    
    // Technische exit signalen
    const rsi = parseFloat(technical.rsi) || 50;
    if (rsi > 70) {
      strategies.push('Let op RSI divergentie voor exit signaal');
    }
    
    if (technical.trend === 'STRONG_UP') {
      strategies.push('Monitor volume voor trend verzwakking');
    }
    
    return strategies;
  }

  // Helper functies voor reasoning
  getStopLossReasoning(riskProfile, technical, percent) {
    const reasons = [`${riskProfile.toLowerCase()} risicoprofiel (${percent.toFixed(1)}%)`];
    
    if (technical.trend === 'STRONG_UP') {
      reasons.push('aangepast voor sterke uptrend');
    }
    
    const rsi = parseFloat(technical.rsi) || 50;
    if (rsi > 70) {
      reasons.push('strakker vanwege overbought condities');
    } else if (rsi < 30) {
      reasons.push('ruimer vanwege oversold condities');
    }
    
    return reasons.join(', ');
  }

  getTakeProfitReasoning(riskProfile, technical, percent) {
    const reasons = [`${riskProfile.toLowerCase()} target (${percent.toFixed(1)}%)`];
    
    if (technical.trend === 'STRONG_UP') {
      reasons.push('verhoogd voor momentum trade');
    }
    
    return reasons.join(', ');
  }

  getHoldingPeriodSignals(technical) {
    const signals = [];
    
    signals.push('Monitor RSI voor overbought/oversold condities');
    signals.push('Let op trend veranderingen in moving averages');
    signals.push('Volg volume voor bevestiging van bewegingen');
    
    if (technical.trend === 'STRONG_UP') {
      signals.push('Kijk naar momentum divergentie als exit signaal');
    }
    
    return signals;
  }

  // Genereer risk management samenvatting
  generateRiskSummary(riskData) {
    const { riskReward, maxLoss, expectedGain, riskProfile } = riskData;
    
    let riskLevel = 'MEDIUM';
    if (riskProfile === 'CONSERVATIVE' && riskReward.ratio >= 2) {
      riskLevel = 'LOW';
    } else if (riskProfile === 'AGGRESSIVE' || riskReward.ratio < 1.5) {
      riskLevel = 'HIGH';
    }
    
    return {
      riskLevel: riskLevel,
      recommendation: riskReward.ratio >= 2 ? 'FAVORABLE' : 'CAUTION',
      keyPoints: [
        `Risk/Reward ratio: ${riskReward.ratio}:1 (${riskReward.quality})`,
        `Maximum verlies: ${maxLoss.portfolioImpact}% van portfolio`,
        `Verwachte winst: ${expectedGain.portfolioImpact}% van portfolio`,
        `Profiel: ${riskProfile} trading strategy`
      ]
    };
  }
}

module.exports = new RiskManager();