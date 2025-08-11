import React, { useState } from 'react';
import './TradingDashboard.css';

const TradingDashboard = ({ analysis, symbol }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Als er geen analysis data is, toon placeholder
  if (!analysis || !analysis.currentPrice) {
    return (
      <div className="trading-dashboard">
        <div className="dashboard-header">
          <h3>🎯 Trading Dashboard</h3>
          <p>Analyseer een aandeel om trading guidance te krijgen</p>
        </div>
      </div>
    );
  }

  // Bereken trading data op basis van bestaande analysis
  const tradingData = calculateTradingPlan(analysis);

  return (
    <div className="trading-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h3>🎯 Trading Dashboard</h3>
        <div className="symbol-badge">{symbol}</div>
      </div>

      {/* Main Trading Info Grid */}
      <div className="trading-grid">
        {/* Current Price */}
        <div className="trading-card current-price-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">Current Price</div>
            <div className="card-value">${analysis.currentPrice}</div>
            <div className={`card-change ${analysis.priceChangePercent > 0 ? 'positive' : 'negative'}`}>
              {analysis.priceChangePercent > 0 ? '+' : ''}{analysis.priceChangePercent?.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Stop Loss */}
        <div className="trading-card stop-loss-card">
          <div className="card-icon">🛡️</div>
          <div className="card-content">
            <div className="card-label">Stop Loss</div>
            <div className="card-value">${tradingData.stopLoss.price}</div>
            <div className="card-change negative">-{tradingData.stopLoss.percent}%</div>
            <div className="card-reasoning">{tradingData.stopLoss.reasoning}</div>
          </div>
        </div>

        {/* Take Profit */}
        <div className="trading-card take-profit-card">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <div className="card-label">Take Profit Target</div>
            <div className="card-value">${tradingData.takeProfit.target1.price}</div>
            <div className="card-change positive">+{tradingData.takeProfit.target1.percent}%</div>
            <div className="card-reasoning">{tradingData.takeProfit.target1.action}</div>
          </div>
        </div>

        {/* Holding Period */}
        <div className="trading-card holding-period-card">
          <div className="card-icon">⏰</div>
          <div className="card-content">
            <div className="card-label">Holding Period</div>
            <div className="card-value">{tradingData.holdingPeriod.duration}</div>
            <div className="card-change neutral">{tradingData.holdingPeriod.type}</div>
            <div className="card-reasoning">{tradingData.holdingPeriod.reasoning}</div>
          </div>
        </div>
      </div>

      {/* Position Sizing */}
      <div className="position-section">
        <h4>📊 Position Sizing</h4>
        <div className="position-grid">
          <div className="position-item">
            <span className="position-label">Recommended Position Size:</span>
            <span className="position-value">{tradingData.positionSize.percentage}% of portfolio</span>
          </div>
          <div className="position-item">
            <span className="position-label">Risk per Trade:</span>
            <span className="position-value risk">{tradingData.riskReward.risk}% portfolio risk</span>
          </div>
          <div className="position-item">
            <span className="position-label">Risk/Reward Ratio:</span>
            <span className={`position-value ${tradingData.riskReward.quality.toLowerCase()}`}>
              {tradingData.riskReward.ratio}:1 ({tradingData.riskReward.quality})
            </span>
          </div>
        </div>
      </div>

      {/* Trading Plan Timeline */}
      <div className="timeline-section">
        <h4>📅 Trading Plan</h4>
        <div className="timeline">
          {tradingData.timeline.map((step, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-icon">{step.icon}</div>
              <div className="timeline-content">
                <div className="timeline-title">{step.title}</div>
                <div className="timeline-description">{step.description}</div>
                <div className="timeline-time">{step.timeframe}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exit Strategy */}
      <div className="exit-strategy-section">
        <h4>🚪 Exit Strategy</h4>
        <div className="exit-steps">
          {tradingData.exitStrategy.map((step, index) => (
            <div key={index} className="exit-step">
              <div className="step-number">{index + 1}</div>
              <div className="step-content">
                <div className="step-condition">{step.condition}</div>
                <div className="step-action">{step.action}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="advanced-section">
        <button 
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          🔧 Advanced Settings {showAdvanced ? '▼' : '▶'}
        </button>
        
        {showAdvanced && (
          <div className="advanced-content">
            <div className="advanced-grid">
              <div className="advanced-item">
                <label>Custom Stop Loss ($)</label>
                <input type="number" step="0.01" placeholder={tradingData.stopLoss.price} />
              </div>
              <div className="advanced-item">
                <label>Custom Take Profit ($)</label>
                <input type="number" step="0.01" placeholder={tradingData.takeProfit.target1.price} />
              </div>
              <div className="advanced-item">
                <label>Position Size (%)</label>
                <input type="number" step="0.5" max="20" placeholder={tradingData.positionSize.percentage} />
              </div>
            </div>
            <button className="recalculate-btn">⚡ Recalculate Plan</button>
          </div>
        )}
      </div>

      {/* Key Alerts */}
      <div className="alerts-section">
        <h4>🔔 Key Monitoring Alerts</h4>
        <div className="alerts-list">
          {tradingData.alerts.map((alert, index) => (
            <div key={index} className={`alert-item ${alert.type}`}>
              <div className="alert-icon">{alert.icon}</div>
              <div className="alert-text">{alert.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper functie om trading plan te berekenen
const calculateTradingPlan = (analysis) => {
  const currentPrice = analysis.currentPrice;
  const recommendation = analysis.recommendation;
  const confidence = analysis.confidence;
  const rsi = analysis.technicalData?.rsi ? parseFloat(analysis.technicalData.rsi) : 50;
  const trend = analysis.technicalData?.trend || 'NEUTRAL';

  // Bepaal risk profile op basis van confidence en market conditions
  let riskProfile = 'MODERATE';
  if (confidence >= 80 && (trend === 'STRONG_UP' || trend === 'UP')) {
    riskProfile = 'AGGRESSIVE';
  } else if (confidence < 65 || trend === 'DOWN') {
    riskProfile = 'CONSERVATIVE';
  }

  // Risk profile settings
  const profiles = {
    CONSERVATIVE: { stopLoss: 3, takeProfit: 6, position: 3, holding: '1-3 maanden' },
    MODERATE: { stopLoss: 5, takeProfit: 12, position: 5, holding: '2-8 weken' },
    AGGRESSIVE: { stopLoss: 8, takeProfit: 20, position: 8, holding: '1-4 weken' }
  };

  const profile = profiles[riskProfile];

  // Bereken stop loss (aangepast voor RSI)
  let stopLossPercent = profile.stopLoss;
  if (rsi > 70) stopLossPercent *= 0.8; // Tighter stop bij overbought
  if (rsi < 30) stopLossPercent *= 1.2; // Looser stop bij oversold

  const stopLossPrice = currentPrice * (1 - stopLossPercent / 100);
  const takeProfitPrice = currentPrice * (1 + profile.takeProfit / 100);
  const secondaryTakeProfitPrice = currentPrice * (1 + (profile.takeProfit * 1.5) / 100);

  // Risk/Reward berekening
  const risk = currentPrice - stopLossPrice;
  const reward = takeProfitPrice - currentPrice;
  const riskRewardRatio = reward / risk;
  const riskQuality = riskRewardRatio >= 2 ? 'EXCELLENT' : riskRewardRatio >= 1.5 ? 'GOOD' : 'POOR';

  return {
    stopLoss: {
      price: stopLossPrice.toFixed(2),
      percent: stopLossPercent.toFixed(1),
      reasoning: `${riskProfile.toLowerCase()} profiel ${rsi > 70 ? '(aangepast voor overbought)' : rsi < 30 ? '(aangepast voor oversold)' : ''}`
    },
    takeProfit: {
      target1: {
        price: takeProfitPrice.toFixed(2),
        percent: profile.takeProfit.toFixed(1),
        action: 'Verkoop 60% van positie'
      },
      target2: {
        price: secondaryTakeProfitPrice.toFixed(2),
        percent: (profile.takeProfit * 1.5).toFixed(1),
        action: 'Verkoop resterende 40%'
      }
    },
    holdingPeriod: {
      duration: profile.holding,
      type: riskProfile,
      reasoning: `Gebaseerd op ${confidence}% confidence en ${trend.toLowerCase()} trend`
    },
    positionSize: {
      percentage: profile.position,
      reasoning: `${riskProfile} profiel met ${confidence}% confidence`
    },
    riskReward: {
      ratio: riskRewardRatio.toFixed(2),
      risk: ((risk / currentPrice) * profile.position).toFixed(2),
      quality: riskQuality
    },
    timeline: [
      {
        icon: '🎯',
        title: 'Entry Point',
        description: recommendation === 'BUY' ? 'Koop nu tegen huidige prijs' : 'Wacht op betere entry',
        timeframe: 'Nu'
      },
      {
        icon: '📊',
        title: 'Monitor Phase',
        description: 'Volg RSI, volume en nieuws voor trend bevestiging',
        timeframe: 'Eerste 1-2 weken'
      },
      {
        icon: '🎯',
        title: 'First Target',
        description: `Verkoop 60% bij $${takeProfitPrice.toFixed(2)}`,
        timeframe: profile.holding.split('-')[0] + ' weken'
      },
      {
        icon: '🏁',
        title: 'Final Exit',
        description: `Verkoop rest bij $${secondaryTakeProfitPrice.toFixed(2)} of stop loss`,
        timeframe: profile.holding
      }
    ],
    exitStrategy: [
      {
        condition: `Prijs daalt naar $${stopLossPrice.toFixed(2)}`,
        action: 'Verkoop volledige positie (stop loss)'
      },
      {
        condition: `Prijs stijgt naar $${takeProfitPrice.toFixed(2)}`,
        action: 'Verkoop 60% van positie, beweeg stop loss naar break-even'
      },
      {
        condition: 'RSI boven 80 voor 3+ dagen',
        action: 'Overweeg vervroegde exit (overbought)'
      },
      {
        condition: `Prijs bereikt $${secondaryTakeProfitPrice.toFixed(2)}`,
        action: 'Verkoop resterende 40% van positie'
      }
    ],
    alerts: [
      {
        type: 'info',
        icon: '📊',
        message: `Monitor RSI (huidig: ${rsi.toFixed(1)}) voor overbought/oversold signalen`
      },
      {
        type: 'warning',
        icon: '⚠️',
        message: trend === 'DOWN' ? 'Let op neerwaartse trend - extra voorzichtig' : 'Volg volume voor trend bevestiging'
      },
      {
        type: 'success',
        icon: '✅',
        message: `${riskRewardRatio.toFixed(2)}:1 risk/reward ratio is ${riskQuality.toLowerCase()}`
      }
    ]
  };
};

export default TradingDashboard;