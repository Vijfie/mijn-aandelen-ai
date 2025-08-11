import React, { useState } from 'react';
import './RiskManagementPanel.css';

const RiskManagementPanel = ({ riskData, stockSymbol, currentPrice }) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [customValues, setCustomValues] = useState({
    stopLoss: riskData?.stopLoss?.price || '',
    takeProfit: riskData?.takeProfit?.primary?.price || '',
    positionSize: riskData?.positionSize?.percentage || ''
  });

  if (!riskData) {
    return (
      <div className="risk-panel-placeholder">
        <div className="placeholder-content">
          <div className="placeholder-icon">⚠️</div>
          <p>Analyseer een aandeel om risk management te zien</p>
        </div>
      </div>
    );
  }

  const getRiskLevelColor = (level) => {
    const colors = {
      LOW: '#10b981',
      MEDIUM: '#f59e0b', 
      HIGH: '#ef4444'
    };
    return colors[level] || '#6b7280';
  };

  const getProfileColor = (profile) => {
    const colors = {
      CONSERVATIVE: '#10b981',
      MODERATE: '#f59e0b',
      AGGRESSIVE: '#ef4444'
    };
    return colors[profile] || '#6b7280';
  };

  return (
    <div className="risk-management-panel">
      {/* Header */}
      <div className="risk-header">
        <div className="risk-title">
          <h3>🎯 Risk Management</h3>
          <span className="risk-symbol">{stockSymbol}</span>
        </div>
        <div 
          className="risk-level-badge" 
          style={{ 
            backgroundColor: getRiskLevelColor(riskData.summary.riskLevel),
            color: 'white'
          }}
        >
          {riskData.summary.riskLevel} RISK
        </div>
      </div>

      {/* Risk Profile */}
      <div className="risk-profile-section">
        <div className="section-title">📊 Trading Profile</div>
        <div 
          className="profile-badge" 
          style={{
            backgroundColor: getProfileColor(riskData.profile),
            color: 'white'
          }}
        >
          {riskData.profile}
        </div>
        <div className="profile-details">
          <span className="profile-period">{riskData.holdingPeriod.period}</span>
        </div>
      </div>

      {/* Current Price & Targets */}
      <div className="price-targets-grid">
        {/* Stop Loss */}
        <div className="target-card stop-loss">
          <div className="target-header">
            <span className="target-icon">🛡️</span>
            <span className="target-label">Stop Loss</span>
          </div>
          <div className="target-price">${riskData.stopLoss.price}</div>
          <div className="target-percent">-{riskData.stopLoss.percentage}%</div>
          <div className="target-reasoning">{riskData.stopLoss.reasoning}</div>
        </div>

        {/* Current Price */}
        <div className="target-card current-price">
          <div className="target-header">
            <span className="target-icon">💰</span>
            <span className="target-label">Current Price</span>
          </div>
          <div className="target-price">${currentPrice}</div>
          <div className="target-percent">Entry Point</div>
        </div>

        {/* Take Profit */}
        <div className="target-card take-profit">
          <div className="target-header">
            <span className="target-icon">🎯</span>
            <span className="target-label">Take Profit</span>
          </div>
          <div className="target-price">${riskData.takeProfit.primary.price}</div>
          <div className="target-percent">+{riskData.takeProfit.primary.percentage.toFixed(1)}%</div>
          <div className="target-allocation">{riskData.takeProfit.primary.allocation} van positie</div>
        </div>
      </div>

      {/* Risk/Reward Metrics */}
      <div className="risk-metrics">
        <div className="metrics-title">📈 Risk/Reward Analysis</div>
        
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-label">Risk/Reward Ratio</div>
            <div className={`metric-value ${riskData.riskReward.quality.toLowerCase()}`}>
              {riskData.riskReward.ratio}:1
            </div>
            <div className="metric-quality">{riskData.riskReward.quality}</div>
          </div>

          <div className="metric-item">
            <div className="metric-label">Position Size</div>
            <div className="metric-value">{riskData.positionSize.percentage}%</div>
            <div className="metric-note">van portfolio</div>
          </div>

          <div className="metric-item">
            <div className="metric-label">Max Loss</div>
            <div className="metric-value risk">${riskData.maxLoss.perShare}</div>
            <div className="metric-note">{riskData.maxLoss.portfolioImpact}% portfolio impact</div>
          </div>

          <div className="metric-item">
            <div className="metric-label">Expected Gain</div>
            <div className="metric-value profit">${riskData.expectedGain.perShare}</div>
            <div className="metric-note">{riskData.expectedGain.portfolioImpact}% portfolio impact</div>
          </div>
        </div>
      </div>

      {/* Exit Strategy */}
      <div className="exit-strategy">
        <div className="strategy-title">🚪 Exit Strategy</div>
        <div className="strategy-list">
          {riskData.exitStrategy.map((strategy, index) => (
            <div key={index} className="strategy-item">
              <span className="strategy-bullet">•</span>
              <span className="strategy-text">{strategy}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Monitoring Signals */}
      <div className="monitoring-signals">
        <div className="signals-title">👁️ Monitor These Signals</div>
        <div className="signals-list">
          {riskData.holdingPeriod.signals.map((signal, index) => (
            <div key={index} className="signal-item">
              <span className="signal-icon">📡</span>
              <span className="signal-text">{signal}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="calculate-btn"
          onClick={() => setShowCalculator(!showCalculator)}
        >
          🧮 Custom Calculator
        </button>
        <button className="set-alerts-btn">
          🔔 Set Price Alerts
        </button>
      </div>

      {/* Custom Calculator (collapsible) */}
      {showCalculator && (
        <div className="custom-calculator">
          <div className="calculator-title">🔧 Custom Risk Calculator</div>
          <div className="calculator-inputs">
            <div className="input-group">
              <label>Custom Stop Loss ($)</label>
              <input
                type="number"
                step="0.01"
                value={customValues.stopLoss}
                onChange={(e) => setCustomValues({...customValues, stopLoss: e.target.value})}
                placeholder={riskData.stopLoss.price}
              />
            </div>
            <div className="input-group">
              <label>Custom Take Profit ($)</label>
              <input
                type="number"
                step="0.01"
                value={customValues.takeProfit}
                onChange={(e) => setCustomValues({...customValues, takeProfit: e.target.value})}
                placeholder={riskData.takeProfit.primary.price}
              />
            </div>
            <div className="input-group">
              <label>Position Size (%)</label>
              <input
                type="number"
                step="0.1"
                max="20"
                value={customValues.positionSize}
                onChange={(e) => setCustomValues({...customValues, positionSize: e.target.value})}
                placeholder={riskData.positionSize.percentage}
              />
            </div>
          </div>
          <button className="recalculate-btn">
            ⚡ Recalculate Risk
          </button>
        </div>
      )}
    </div>
  );
};

export default RiskManagementPanel;