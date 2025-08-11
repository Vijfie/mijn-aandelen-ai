import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TradePerformanceDashboard = () => {
  const [trades, setTrades] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [insights, setInsights] = useState([]);
  const [pendingTrades, setPendingTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTrade, setSelectedTrade] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

const loadDashboardData = async () => {
  setLoading(true);
  try {
    const [tradesRes, performanceRes, insightsRes, pendingRes] = await Promise.all([
      axios.get('http://localhost:3001/api/trades'),
      axios.get('http://localhost:3001/api/performance'),
      axios.get('http://localhost:3001/api/insights').catch(() => ({ data: { insights: [], summary: {} } })),
      axios.get('http://localhost:3001/api/trades/pending')
    ]);

    setTrades(tradesRes.data.trades || []);
    setPerformance(performanceRes.data.performance || {
      totalTrades: 0,
      accuracy: 0,
      avgProfitLoss: 0,
      totalProfitLoss: 0
    });
    setInsights(insightsRes.data.insights || []);
    setPendingTrades(pendingRes.data.trades || []);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    // Safe defaults
    setPerformance({
      totalTrades: 0,
      accuracy: 0,
      avgProfitLoss: 0,
      totalProfitLoss: 0
    });
    setInsights([]);
    setPendingTrades([]);
    setTrades([]);
  }
  setLoading(false);
};
  const updateTradeResult = async (tradeId, result) => {
    try {
      await axios.post(`http://localhost:3001/api/trades/${tradeId}/result`, result);
      loadDashboardData(); // Refresh data
      alert('Trade result updated successfully!');
    } catch (error) {
      alert('Failed to update trade result: ' + error.response?.data?.error || error.message);
    }
  };

  const ResultUpdateForm = ({ trade, onClose }) => {
    const [outcome, setOutcome] = useState('');
    const [profitLoss, setProfitLoss] = useState('');
    const [closePrice, setClosePrice] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      const result = {
        outcome,
        profitLoss: parseFloat(profitLoss),
        closePrice: parseFloat(closePrice),
        notes
      };
      updateTradeResult(trade.id, result);
      onClose();
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Update Trade Result</h3>
            <button onClick={onClose} className="close-btn">×</button>
          </div>
          
          <div className="trade-info">
            <h4>{trade.symbol} - {trade.recommendation}</h4>
            <p>Entry Price: ${trade.currentPrice}</p>
            <p>Confidence: {trade.confidence}%</p>
            <p>Date: {new Date(trade.timestamp).toLocaleDateString()}</p>
          </div>

          <form onSubmit={handleSubmit} className="result-form">
            <div className="form-group">
              <label>Outcome:</label>
              <select value={outcome} onChange={(e) => setOutcome(e.target.value)} required>
                <option value="">Select outcome...</option>
                <option value="WIN">Win 🟢</option>
                <option value="LOSS">Loss 🔴</option>
                <option value="NEUTRAL">Neutral ⚪</option>
              </select>
            </div>

            <div className="form-group">
              <label>Profit/Loss (%):</label>
              <input
                type="number"
                step="0.01"
                value={profitLoss}
                onChange={(e) => setProfitLoss(e.target.value)}
                placeholder="e.g. 5.2 or -3.1"
                required
              />
            </div>

            <div className="form-group">
              <label>Close Price ($):</label>
              <input
                type="number"
                step="0.01"
                value={closePrice}
                onChange={(e) => setClosePrice(e.target.value)}
                placeholder="e.g. 142.50"
                required
              />
            </div>

            <div className="form-group">
              <label>Notes (optional):</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this trade..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
              <button type="submit" className="submit-btn">Update Result</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const PerformanceOverview = () => (
    <div className="overview-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{performance.totalTrades || 0}</div>
            <div className="stat-label">Total Trades</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{(performance.accuracy || 0).toFixed(1)}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className={`stat-value ${(performance.avgProfitLoss || 0) >= 0 ? 'positive' : 'negative'}`}>
              {(performance.avgProfitLoss || 0) >= 0 ? '+' : ''}{(performance.avgProfitLoss || 0).toFixed(2)}%
            </div>
            <div className="stat-label">Avg Profit/Loss</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className={`stat-value ${(performance.totalProfitLoss || 0) >= 0 ? 'positive' : 'negative'}`}>
              {(performance.totalProfitLoss || 0) >= 0 ? '+' : ''}{(performance.totalProfitLoss || 0).toFixed(2)}%
            </div>
            <div className="stat-label">Total P&L</div>
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      {performance.recentPerformance && (
        <div className="recent-performance">
          <h3>📅 Last 30 Days</h3>
          <div className="recent-stats">
            <div className="recent-stat">
              <span className="label">Trades:</span>
              <span className="value">{performance.recentPerformance.trades}</span>
            </div>
            <div className="recent-stat">
              <span className="label">Accuracy:</span>
              <span className="value">{performance.recentPerformance.accuracy.toFixed(1)}%</span>
            </div>
            <div className="recent-stat">
              <span className="label">Avg P&L:</span>
              <span className={`value ${performance.recentPerformance.avgProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                {performance.recentPerformance.avgProfitLoss >= 0 ? '+' : ''}{performance.recentPerformance.avgProfitLoss.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="insights-section">
          <h3>🧠 AI Insights & Improvements</h3>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <div className="insight-icon">
                  {insight.type === 'warning' ? '⚠️' : insight.type === 'success' ? '✅' : 'ℹ️'}
                </div>
                <div className="insight-content">
                  <div className="insight-category">{insight.category.toUpperCase()}</div>
                  <div className="insight-message">{insight.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const PendingTradesSection = () => (
    <div className="pending-section">
      <h3>⏳ Pending Trades ({pendingTrades.length})</h3>
      <p>These trades are waiting for results. Click "Update Result" to log the outcome.</p>
      
      <div className="trades-table">
        <div className="table-header">
          <div>Symbol</div>
          <div>Recommendation</div>
          <div>Confidence</div>
          <div>Entry Price</div>
          <div>Date</div>
          <div>Days Ago</div>
          <div>Action</div>
        </div>
        
        {pendingTrades.map((trade) => (
          <div key={trade.id} className="table-row">
            <div className="symbol">{trade.symbol}</div>
            <div className={`recommendation ${trade.recommendation.toLowerCase().replace(' ', '-')}`}>
              {trade.recommendation}
            </div>
            <div className="confidence">{trade.confidence}%</div>
            <div className="price">${trade.currentPrice}</div>
            <div className="date">{new Date(trade.timestamp).toLocaleDateString()}</div>
            <div className="days-ago">{Math.ceil((new Date() - new Date(trade.timestamp)) / (1000 * 60 * 60 * 24))} days</div>
            <div className="actions">
              <button 
                onClick={() => setSelectedTrade(trade)}
                className="update-btn"
              >
                Update Result
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AnalyticsSection = () => (
    <div className="analytics-section">
      <h3>📊 Performance Analytics</h3>
      
      {/* Confidence Analysis */}
      {performance.byConfidence && (
        <div className="analysis-card">
          <h4>🎯 Performance by Confidence Level</h4>
          <div className="confidence-analysis">
            {Object.entries(performance.byConfidence).map(([range, data]) => (
              <div key={range} className="confidence-row">
                <div className="confidence-range">{range}</div>
                <div className="confidence-stats">
                  <span className="trades">{data.total} trades</span>
                  <span className="accuracy">{data.accuracy.toFixed(1)}% accuracy</span>
                  <span className={`avg-pl ${data.avgProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                    {data.avgProfitLoss >= 0 ? '+' : ''}{data.avgProfitLoss.toFixed(2)}% avg P&L
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Analysis */}
      {performance.byTrend && (
        <div className="analysis-card">
          <h4>📈 Performance by Market Trend</h4>
          <div className="trend-analysis">
            {Object.entries(performance.byTrend).map(([trend, data]) => (
              <div key={trend} className="trend-row">
                <div className="trend-name">{trend}</div>
                <div className="trend-stats">
                  <span className="trades">{data.total} trades</span>
                  <span className="accuracy">{data.accuracy.toFixed(1)}% accuracy</span>
                  <span className={`avg-pl ${data.avgProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                    {data.avgProfitLoss >= 0 ? '+' : ''}{data.avgProfitLoss.toFixed(2)}% avg P&L
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RSI Analysis */}
      {performance.byRSI && (
        <div className="analysis-card">
          <h4>⚡ Performance by RSI Range</h4>
          <div className="rsi-analysis">
            {Object.entries(performance.byRSI).map(([range, data]) => (
              <div key={range} className="rsi-row">
                <div className="rsi-range">{range}</div>
                <div className="rsi-stats">
                  <span className="trades">{data.total} trades</span>
                  <span className="accuracy">{data.accuracy.toFixed(1)}% accuracy</span>
                  <span className={`avg-pl ${data.avgProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                    {data.avgProfitLoss >= 0 ? '+' : ''}{data.avgProfitLoss.toFixed(2)}% avg P&L
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const AllTradesSection = () => (
    <div className="all-trades-section">
      <h3>📋 All Trades ({trades.length})</h3>
      
      <div className="trades-table">
        <div className="table-header">
          <div>Symbol</div>
          <div>Recommendation</div>
          <div>Confidence</div>
          <div>Entry Price</div>
          <div>Result</div>
          <div>P&L</div>
          <div>Date</div>
          <div>Status</div>
        </div>
        
        {trades.map((trade) => (
          <div key={trade.id} className="table-row">
            <div className="symbol">{trade.symbol}</div>
            <div className={`recommendation ${trade.recommendation.toLowerCase().replace(' ', '-')}`}>
              {trade.recommendation}
            </div>
            <div className="confidence">{trade.confidence}%</div>
            <div className="price">${trade.currentPrice}</div>
            <div className={`result ${trade.actualOutcome?.toLowerCase() || ''}`}>
              {trade.actualOutcome || 'Pending'}
            </div>
            <div className={`pl ${trade.actualProfitLoss >= 0 ? 'positive' : 'negative'}`}>
              {trade.actualProfitLoss ? 
                `${trade.actualProfitLoss >= 0 ? '+' : ''}${trade.actualProfitLoss.toFixed(2)}%` : 
                '-'
              }
            </div>
            <div className="date">{new Date(trade.timestamp).toLocaleDateString()}</div>
            <div className={`status ${trade.status.toLowerCase()}`}>{trade.status}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="trade-performance-dashboard">
      <div className="dashboard-header">
        <h1>📊 Trade Performance Dashboard</h1>
        <p>Track AI predictions and improve trading accuracy</p>
        <button onClick={loadDashboardData} className="refresh-btn">🔄 Refresh</button>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingTrades.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'all-trades' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-trades')}
        >
          All Trades ({trades.length})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && <PerformanceOverview />}
        {activeTab === 'pending' && <PendingTradesSection />}
        {activeTab === 'analytics' && <AnalyticsSection />}
        {activeTab === 'all-trades' && <AllTradesSection />}
      </div>

      {selectedTrade && (
        <ResultUpdateForm 
          trade={selectedTrade} 
          onClose={() => setSelectedTrade(null)} 
        />
      )}

      <style jsx>{`
        .trade-performance-dashboard {
          background: linear-gradient(135deg, #0f172a, #1e293b);
          min-height: 100vh;
          color: #e2e8f0;
          padding: 20px;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 30px;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 20px;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .dashboard-header h1 {
          margin: 0 0 10px 0;
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(135deg, #3b82f6, #10b981);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .refresh-btn {
          margin-top: 15px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .dashboard-tabs {
          display: flex;
          gap: 5px;
          margin-bottom: 30px;
          background: rgba(15, 23, 42, 0.6);
          padding: 5px;
          border-radius: 15px;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .tab-btn {
          flex: 1;
          padding: 15px 20px;
          background: transparent;
          color: #94a3b8;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          transform: translateY(-2px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: rgba(15, 23, 42, 0.6);
          padding: 25px;
          border-radius: 15px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .stat-icon {
          font-size: 32px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 900;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 5px;
        }

        .stat-value.positive {
          color: #10b981;
        }

        .stat-value.negative {
          color: #ef4444;
        }

        .stat-label {
          font-size: 14px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .trades-table {
          background: rgba(15, 23, 42, 0.6);
          border-radius: 15px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 80px 120px 80px 100px 80px 80px 100px 100px;
          gap: 15px;
          padding: 20px;
          background: rgba(15, 23, 42, 0.8);
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #cbd5e1;
        }

        .table-row {
          display: grid;
          grid-template-columns: 80px 120px 80px 100px 80px 80px 100px 100px;
          gap: 15px;
          padding: 20px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          align-items: center;
        }

        .table-row:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .symbol {
          font-weight: 700;
          color: #60a5fa;
        }

        .recommendation {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
        }

        .recommendation.buy,
        .recommendation.strong-buy {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .recommendation.sell,
        .recommendation.strong-sell {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .recommendation.hold {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .confidence {
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
        }

        .update-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #1e293b;
          border-radius: 20px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 24px;
          cursor: pointer;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #cbd5e1;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 14px;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
        }

        .cancel-btn {
          padding: 12px 24px;
          background: rgba(148, 163, 184, 0.2);
          color: #94a3b8;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .submit-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .insights-section {
          margin-top: 30px;
        }

        .insight-card {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 20px;
          margin-bottom: 15px;
          border-radius: 12px;
          border-left: 4px solid;
        }

        .insight-card.warning {
          background: rgba(245, 158, 11, 0.1);
          border-left-color: #f59e0b;
        }

        .insight-card.success {
          background: rgba(16, 185, 129, 0.1);
          border-left-color: #10b981;
        }

        .insight-card.info {
          background: rgba(59, 130, 246, 0.1);
          border-left-color: #3b82f6;
        }

        .insight-category {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 5px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(59, 130, 246, 0.3);
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TradePerformanceDashboard;