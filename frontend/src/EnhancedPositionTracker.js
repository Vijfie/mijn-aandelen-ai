import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Embedded CSS Styles (zonder <style> wrapper)
const cssStyles = `
.enhanced-position-tracker {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.ai-learning-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ai-icon {
  font-size: 48px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.ai-info h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
}

.ai-info p {
  margin: 0;
  opacity: 0.9;
}

.learning-active {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.ai-metrics {
  display: flex;
  gap: 32px;
}

.metric {
  text-align: center;
}

.metric label {
  display: block;
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.metric span {
  display: block;
  font-size: 24px;
  font-weight: 700;
}

.improvement {
  color: #00ff88 !important;
}

.position-entry-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 24px;
}

.add-position-btn {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-position-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
}

.add-position-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.refresh-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.refresh-btn:hover {
  transform: translateY(-1px);
}

.add-position-form {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
  border: 2px dashed #e2e8f0;
}

.add-position-form h3 {
  margin: 0 0 20px 0;
  color: #1e293b;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cancel-btn:hover {
  background: #4b5563;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-1px);
}

.positions-list {
  display: grid;
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #1e293b;
  font-size: 24px;
}

.empty-state p {
  color: #64748b;
  margin: 0;
  font-size: 16px;
}

.position-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.position-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.position-symbol {
  display: flex;
  align-items: center;
  gap: 12px;
}

.position-symbol strong {
  font-size: 20px;
  color: #1e293b;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status.open {
  background: #dcfce7;
  color: #166534;
}

.status.closed {
  background: #e5e7eb;
  color: #374151;
}

.status.pending {
  background: #fef3c7;
  color: #92400e;
}

.status.completed {
  background: #e5e7eb;
  color: #374151;
}

.trade-source {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 8px;
}

.trade-source.tradingview {
  background: #dbeafe;
  color: #1e40af;
}

.trade-source.manual {
  background: #f3e8ff;
  color: #7c3aed;
}

.position-pnl {
  text-align: right;
  font-size: 18px;
  font-weight: 700;
}

.position-pnl small {
  display: block;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.8;
}

.position-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-row span:first-child {
  color: #64748b;
  font-weight: 500;
}

.detail-row span:last-child {
  color: #1e293b;
  font-weight: 600;
}

.recommendation {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.recommendation.strong-buy {
  background: #dcfce7;
  color: #166534;
}

.recommendation.buy {
  background: #dbeafe;
  color: #1e40af;
}

.recommendation.hold {
  background: #fef3c7;
  color: #92400e;
}

.recommendation.sell {
  background: #fecaca;
  color: #991b1b;
}

.recommendation.strong-sell {
  background: #fecaca;
  color: #7f1d1d;
}

.reason {
  font-style: italic;
  color: #64748b;
  font-size: 14px;
}

.position-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.update-btn,
.close-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.update-btn {
  background: #f3f4f6;
  color: #374151;
}

.update-btn:hover {
  background: #e5e7eb;
}

.close-btn {
  background: #ef4444;
  color: white;
}

.close-btn:hover {
  background: #dc2626;
}

.ai-learning-progress {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.ai-learning-progress h3 {
  margin: 0 0 16px 0;
  color: #1e293b;
}

.ai-learning-progress ul {
  margin: 16px 0;
  padding-left: 20px;
}

.ai-learning-progress li {
  margin-bottom: 8px;
  color: #374151;
}

.learning-tips {
  background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
  padding: 16px;
  border-radius: 12px;
  margin-top: 20px;
  border-left: 4px solid #f59e0b;
}

@media (max-width: 768px) {
  .enhanced-position-tracker {
    padding: 16px;
  }
  
  .ai-learning-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .ai-metrics {
    justify-content: center;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .position-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .position-details {
    grid-template-columns: 1fr;
  }
}
`;

// Inject styles once (client-side only)
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = cssStyles;
  document.head.appendChild(styleElement);
}

function EnhancedPositionTracker() {
  const [positions, setPositions] = useState([]);
  const [realTrades, setRealTrades] = useState([]);
  const [aiLearningData, setAiLearningData] = useState(null);
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newPosition, setNewPosition] = useState({
    symbol: '',
    entryPrice: '',
    quantity: '',
    aiRecommendation: '',
    aiConfidence: '',
    tradeReason: '',
    stopLoss: '',
    targetPrice: ''
  });

  useEffect(() => {
    loadPositions();
    loadRealTrades();
    loadAILearningData();
  }, []);

  const loadPositions = () => {
    const savedPositions = localStorage.getItem('trading_positions');
    if (savedPositions) setPositions(JSON.parse(savedPositions));
  };

  const loadRealTrades = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/trades');
      if (response.data.success) {
        setRealTrades(response.data.trades);
        console.log('📊 Loaded real trades:', response.data.trades.length);
      }
    } catch (error) {
      console.error('❌ Error loading real trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAILearningData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/ml/performance');
      setAiLearningData({
        totalPredictions: response.data.totalPredictions || 0,
        accuracy: response.data.accuracyPercent || 0,
        recentAccuracy: response.data.enhancedAccuracy || 0,
        improvementTrend: '+0%',
        learningPhase: response.data.totalPredictions > 0 ? 'Active Learning' : 'Waiting for Data'
      });
    } catch (error) {
      console.error('❌ Error loading AI data:', error);
      setAiLearningData({
        totalPredictions: 0,
        accuracy: 0,
        recentAccuracy: 0,
        improvementTrend: '+0%',
        learningPhase: 'Waiting for Data'
      });
    }
  };

  const savePositions = (updatedPositions) => {
    localStorage.setItem('trading_positions', JSON.stringify(updatedPositions));
    setPositions(updatedPositions);
  };

  const addPosition = () => {
    if (!newPosition.symbol || !newPosition.entryPrice || !newPosition.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    const position = {
      id: Date.now(),
      ...newPosition,
      entryDate: new Date().toISOString(),
      status: 'OPEN',
      currentPrice: newPosition.entryPrice,
      pnl: 0,
      pnlPercent: 0,
      entryPrice: parseFloat(newPosition.entryPrice),
      quantity: parseInt(newPosition.quantity, 10),
      aiConfidence: parseFloat(newPosition.aiConfidence),
      stopLoss: parseFloat(newPosition.stopLoss) || null,
      targetPrice: parseFloat(newPosition.targetPrice) || null
    };

    const updatedPositions = [...positions, position];
    savePositions(updatedPositions);

    setNewPosition({
      symbol: '',
      entryPrice: '',
      quantity: '',
      aiRecommendation: '',
      aiConfidence: '',
      tradeReason: '',
      stopLoss: '',
      targetPrice: ''
    });
    setIsAddingPosition(false);

    logTradeForAI(position);
  };

  const updatePosition = (positionId, updates) => {
    const updatedPositions = positions.map(pos =>
      pos.id === positionId ? { ...pos, ...updates } : pos
    );
    savePositions(updatedPositions);
  };

  const closePosition = (positionId, exitPrice, outcome) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const finalPnL = (parseFloat(exitPrice) - position.entryPrice) * position.quantity;
    const finalPnLPercent = ((parseFloat(exitPrice) - position.entryPrice) / position.entryPrice) * 100;

    const updates = {
      status: 'CLOSED',
      exitPrice: parseFloat(exitPrice),
      exitDate: new Date().toISOString(),
      finalPnL,
      finalPnLPercent,
      outcome
    };

    updatePosition(positionId, updates);
    sendResultToAI(position, updates);
  };

  const closeRealTrade = async (tradeId, exitPrice, outcome) => {
    try {
      const trade = realTrades.find(t => t.id === tradeId);
      if (!trade) return;

      const profitLoss = ((parseFloat(exitPrice) - trade.currentPrice) / trade.currentPrice) * 100;
      const daysHeld = Math.ceil((new Date() - new Date(trade.timestamp)) / (1000 * 60 * 60 * 24));

      const result = {
        outcome: outcome,
        profitLoss: profitLoss,
        closePrice: parseFloat(exitPrice),
        daysHeld: daysHeld,
        notes: `Closed via Position Tracker`
      };

      const response = await axios.post(`http://localhost:3001/api/trades/${tradeId}/result`, result);
      console.log('🧠 AI learning triggered:', response.data);

      loadRealTrades();
      loadAILearningData();
      
      console.log(`✅ Trade ${tradeId} closed and AI learning triggered`);
    } catch (error) {
      console.error('❌ Error closing real trade:', error);
      alert('Error closing trade. Please try again.');
    }
  };

  const logTradeForAI = async (position) => {
    console.log('🤖 Logging new position for AI learning:', position);
  };

  const sendResultToAI = async (position, result) => {
    console.log('🎯 Sending result to AI for learning:', { position, result });
    const wasCorrect =
      ((position.aiRecommendation === 'BUY' || position.aiRecommendation === 'STRONG BUY') && result.outcome === 'WIN') ||
      ((position.aiRecommendation === 'SELL' || position.aiRecommendation === 'STRONG SELL') && result.outcome === 'WIN') ||
      (position.aiRecommendation === 'HOLD' && result.outcome === 'NEUTRAL');

    console.log(`🧠 AI Learning: ${wasCorrect ? 'CORRECT' : 'INCORRECT'} prediction for ${position.symbol}`);
    console.log(`💰 P&L: ${result.finalPnL > 0 ? '+' : ''}${result.finalPnL.toFixed(2)} (${result.finalPnLPercent.toFixed(2)}%)`);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  const formatPercent = (percent) => {
    const formatted = (percent || 0).toFixed(2);
    return `${percent >= 0 ? '+' : ''}${formatted}%`;
  };

  const getPositionColor = (pnlPercent) => {
    if (pnlPercent > 0) return '#00C851';
    if (pnlPercent < 0) return '#FF4444';
    return '#6c757d';
  };

  const getTradeSource = (trade) => {
    if (trade.source === 'TRADINGVIEW_WEBHOOK') return 'TradingView';
    if (trade.source === 'MANUAL_ENTRY') return 'Manual';
    return trade.source || 'Unknown';
  };

  const getTradeSourceClass = (trade) => {
    if (trade.source === 'TRADINGVIEW_WEBHOOK') return 'tradingview';
    if (trade.source === 'MANUAL_ENTRY') return 'manual';
    return '';
  };

  // Combine real trades with local positions for display
  const allTrades = [
    ...realTrades.map(trade => ({
      ...trade,
      id: trade.id,
      symbol: trade.symbol,
      entryPrice: trade.currentPrice,
      quantity: trade.technicalData?.quantity || 100,
      status: trade.status,
      source: trade.source,
      recommendation: trade.recommendation,
      confidence: trade.confidence,
      reasoning: trade.reasoning,
      entryDate: trade.timestamp,
      isRealTrade: true
    })),
    ...positions.filter(pos => !realTrades.some(trade => trade.symbol === pos.symbol && trade.status === 'PENDING'))
  ];

  return (
    <div className="enhanced-position-tracker">
      {/* AI Learning Status Header */}
      <div className="ai-learning-header">
        <div className="ai-status">
          <div className="ai-icon">🤖</div>
          <div className="ai-info">
            <h3>AI Learning System</h3>
            <p>
              Status: <span className="learning-active">{aiLearningData?.learningPhase}</span>
            </p>
          </div>
        </div>
        <div className="ai-metrics">
          <div className="metric">
            <label>Total Predictions</label>
            <span>{aiLearningData?.totalPredictions}</span>
          </div>
          <div className="metric">
            <label>Current Accuracy</label>
            <span>{aiLearningData?.accuracy}%</span>
          </div>
          <div className="metric">
            <label>Recent Performance</label>
            <span className="improvement">{aiLearningData?.improvementTrend}</span>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <button className="refresh-btn" onClick={() => { loadRealTrades(); loadAILearningData(); }}>
        🔄 Refresh Trades & AI Data
      </button>

      {/* Position Entry Section */}
      <div className="position-entry-section">
        <div className="section-header">
          <h2>📊 Your Trading Positions ({allTrades.length})</h2>
          <button
            className="add-position-btn"
            onClick={() => setIsAddingPosition(true)}
            disabled={positions.length >= 10}
          >
            + Add Manual Position
          </button>
        </div>

        {isAddingPosition && (
          <div className="add-position-form">
            <h3>Add New Position</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Symbol *</label>
                <input
                  type="text"
                  placeholder="AAPL"
                  value={newPosition.symbol}
                  onChange={(e) => setNewPosition({ ...newPosition, symbol: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="form-group">
                <label>Entry Price *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  value={newPosition.entryPrice}
                  onChange={(e) => setNewPosition({ ...newPosition, entryPrice: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  placeholder="100"
                  value={newPosition.quantity}
                  onChange={(e) => setNewPosition({ ...newPosition, quantity: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>AI Recommendation</label>
                <select
                  value={newPosition.aiRecommendation}
                  onChange={(e) => setNewPosition({ ...newPosition, aiRecommendation: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="STRONG BUY">STRONG BUY</option>
                  <option value="BUY">BUY</option>
                  <option value="HOLD">HOLD</option>
                  <option value="SELL">SELL</option>
                  <option value="STRONG SELL">STRONG SELL</option>
                </select>
              </div>
              <div className="form-group">
                <label>AI Confidence (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="75"
                  value={newPosition.aiConfidence}
                  onChange={(e) => setNewPosition({ ...newPosition, aiConfidence: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Stop Loss</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="140.00"
                  value={newPosition.stopLoss}
                  onChange={(e) => setNewPosition({ ...newPosition, stopLoss: e.target.value })}
                />
              </div>
              <div className="form-group full-width">
                <label>Trade Reason</label>
                <textarea
                  placeholder="Why did you take this position based on AI recommendation?"
                  value={newPosition.tradeReason}
                  onChange={(e) => setNewPosition({ ...newPosition, tradeReason: e.target.value })}
                />
              </div>
            </div>
            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setIsAddingPosition(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={addPosition}>
                Add Position
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Positions List */}
      <div className="positions-list">
        {isLoading ? (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <h3>Loading trades...</h3>
            <p>Fetching your latest trading data</p>
          </div>
        ) : allTrades.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📈</div>
            <h3>No positions yet</h3>
            <p>Add your first position or trigger a TradingView webhook to start training the AI</p>
          </div>
        ) : (
          allTrades.map((trade) => (
            <div key={trade.id} className="position-card">
              <div className="position-header">
                <div className="position-symbol">
                  <strong>{trade.symbol}</strong>
                  <span className={`status ${(trade.status || 'open').toLowerCase()}`}>
                    {trade.status || 'OPEN'}
                  </span>
                  <span className={`trade-source ${getTradeSourceClass(trade)}`}>
                    {getTradeSource(trade)}
                  </span>
                </div>
                <div className="position-pnl" style={{ color: getPositionColor(trade.finalPnLPercent || trade.pnlPercent || 0) }}>
                  {formatCurrency(trade.finalPnL || trade.pnl || 0)}
                  <small>({formatPercent(trade.finalPnLPercent || trade.pnlPercent || 0)})</small>
                </div>
              </div>

              <div className="position-details">
                <div className="detail-row">
                  <span>Entry Price:</span>
                  <span>{formatCurrency(trade.entryPrice || trade.currentPrice)}</span>
                </div>
                <div className="detail-row">
                  <span>Quantity:</span>
                  <span>{trade.quantity || 100}</span>
                </div>
                <div className="detail-row">
                  <span>AI Recommendation:</span>
                  <span className={`recommendation ${(trade.recommendation || trade.aiRecommendation || '').toLowerCase().replace(' ', '-')}`}>
                    {trade.recommendation || trade.aiRecommendation} ({trade.confidence || trade.aiConfidence || 0}%)
                  </span>
                </div>
                {(trade.tradeReason || (trade.reasoning && trade.reasoning[0])) && (
                  <div className="detail-row">
                    <span>Reason:</span>
                    <span className="reason">{trade.tradeReason || trade.reasoning[0]}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span>Entry Date:</span>
                  <span>{new Date(trade.entryDate || trade.timestamp).toLocaleDateString()}</span>
                </div>
                {trade.isRealTrade && (
                  <div className="detail-row">
                    <span>Trade ID:</span>
                    <span style={{fontFamily: 'monospace', fontSize: '12px'}}>{trade.id}</span>
                  </div>
                )}
              </div>

              {((trade.status === 'OPEN' || trade.status === 'PENDING') && !trade.isRealTrade) && (
                <div className="position-actions">
                  <button
                    className="update-btn"
                    onClick={() => {
                      const newPrice = prompt('Enter current price:');
                      if (newPrice) {
                        const currentPrice = parseFloat(newPrice);
                        const pnl = (currentPrice - trade.entryPrice) * trade.quantity;
                        const pnlPercent = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
                        updatePosition(trade.id, { currentPrice, pnl, pnlPercent });
                      }
                    }}
                  >
                    Update Price
                  </button>
                  <button
                    className="close-btn"
                    onClick={() => {
                      const exitPrice = prompt('Enter exit price:');
                      const outcome = prompt('Was this a WIN, LOSS, or NEUTRAL?');
                      if (exitPrice && outcome) {
                        closePosition(trade.id, exitPrice, outcome.toUpperCase());
                      }
                    }}
                  >
                    Close Position
                  </button>
                </div>
              )}

              {((trade.status === 'OPEN' || trade.status === 'PENDING') && trade.isRealTrade) && (
                <div className="position-actions">
                  <button
                    className="close-btn"
                    onClick={() => {
                      const exitPrice = prompt(`Enter exit price for ${trade.symbol}:`);
                      const outcome = prompt('Was this a WIN, LOSS, or NEUTRAL?');
                      if (exitPrice && outcome) {
                        closeRealTrade(trade.id, exitPrice, outcome.toUpperCase());
                      }
                    }}
                  >
                    🧠 Close & Train AI
                  </button>
                </div>
              )}

              {trade.isRealTrade && (
                <div style={{marginTop: '12px', padding: '8px', background: '#f8fafc', borderRadius: '6px'}}>
                  <div style={{fontSize: '12px', color: '#6b7280'}}>
                    <strong>AI Enhancement:</strong> This trade is connected to the AI learning system
                  </div>
                  {trade.reasoning && trade.reasoning.length > 1 && (
                    <div style={{fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>
                      <strong>AI Reasoning:</strong> {trade.reasoning.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* AI Learning Progress */}
      <div className="ai-learning-progress">
        <h3>🧠 AI Learning Progress</h3>
        <p>Every position you add helps the AI learn. When you close positions, the AI will:</p>
        <ul>
          <li>✅ Analyze what worked and what didn't</li>
          <li>🎯 Adjust confidence levels for similar setups</li>
          <li>📊 Improve future recommendations</li>
          <li>🔄 Update its prediction algorithms</li>
        </ul>
        
        {realTrades.length > 0 && (
          <div style={{marginTop: '16px', padding: '12px', background: '#dbeafe', borderRadius: '8px'}}>
            <strong>🔗 TradingView Integration Active:</strong> {realTrades.length} trade(s) from TradingView webhooks detected. 
            These will automatically train your AI when closed!
          </div>
        )}
        
        <div className="learning-tips">
          <strong>💡 Pro Tips:</strong>
          <br />• Close TradingView trades via "🧠 Close & Train AI" to trigger learning
          <br />• Add detailed trade reasons to help the AI understand your decision-making
          <br />• More trades = smarter AI predictions!
        </div>
      </div>
    </div>
  );
}

export default EnhancedPositionTracker;