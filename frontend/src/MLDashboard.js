import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MLDashboard.css';

function MLDashboard() {
  const [mlData, setMlData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMLPerformance();
  }, []);

  const fetchMLPerformance = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/ml/performance');
      setMlData(response.data);
    } catch (error) {
      console.error('Error fetching ML data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="ml-dashboard">
        <div className="ml-loading">
          🤖 Loading AI Performance Data...
        </div>
      </div>
    );
  }

  if (!mlData) {
    return (
      <div className="ml-dashboard">
        <div className="ml-empty">
          🤖 No AI performance data available yet. Make some predictions first!
        </div>
      </div>
    );
  }

  return (
    <div className="ml-dashboard">
      <div className="ml-header">
        <h2>🤖 Machine Learning AI Dashboard</h2>
        <p>Real-time AI performance metrics and learning analytics</p>
      </div>

      {/* Performance Overview */}
      <div className="ml-performance-grid">
        <div className="ml-metric-card accuracy">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-value">{mlData.accuracyPercent}%</div>
            <div className="metric-label">Prediction Accuracy</div>
            <div className="metric-subtitle">
              {mlData.correctPredictions}/{mlData.totalPredictions} correct
            </div>
          </div>
        </div>

        <div className="ml-metric-card predictions">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-value">{mlData.totalPredictions}</div>
            <div className="metric-label">Total Predictions</div>
            <div className="metric-subtitle">Continuously learning</div>
          </div>
        </div>

        <div className="ml-metric-card confidence">
          <div className="metric-icon">🎛️</div>
          <div className="metric-content">
            <div className="metric-value">{mlData.confidenceCalibration.toFixed(2)}x</div>
            <div className="metric-label">Confidence Factor</div>
            <div className="metric-subtitle">Auto-adjusting</div>
          </div>
        </div>

        <div className="ml-metric-card status">
          <div className="metric-icon">🧠</div>
          <div className="metric-content">
            <div className="metric-value">
              {mlData.totalPredictions > 50 ? 'Expert' : 
               mlData.totalPredictions > 20 ? 'Learning' : 'Training'}
            </div>
            <div className="metric-label">AI Status</div>
            <div className="metric-subtitle">
              {mlData.totalPredictions > 50 ? 'Highly experienced' : 'Building experience'}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Predictions */}
      {mlData.recentPredictions && mlData.recentPredictions.length > 0 && (
        <div className="ml-recent-predictions">
          <h3>🔮 Recent AI Predictions</h3>
          <div className="predictions-list">
            {mlData.recentPredictions.slice(0, 5).map((prediction, index) => (
              <div key={prediction.id} className={`prediction-item ${prediction.recommendation.toLowerCase().replace(' ', '-')}`}>
                <div className="prediction-header">
                  <span className="prediction-symbol">{prediction.symbol}</span>
                  <span className="prediction-date">
                    {new Date(prediction.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="prediction-content">
                  <div className="prediction-recommendation">
                    {prediction.recommendation}
                  </div>
                  <div className="prediction-confidence">
                    {prediction.confidence}% confident
                  </div>
                </div>
                <div className="prediction-status">
                  {prediction.isEvaluated ? (
                    <span className={`evaluation ${prediction.actualOutcome.isCorrect ? 'correct' : 'incorrect'}`}>
                      {prediction.actualOutcome.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                      <small>({prediction.actualOutcome.priceChange.toFixed(1)}%)</small>
                    </span>
                  ) : (
                    <span className="evaluation pending">⏳ Evaluating...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Learning Insights */}
      <div className="ml-insights">
        <h3>🧠 AI Learning Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>📈 Performance Trend</h4>
            <p>
              {mlData.accuracy > 0.7 ? 
                "AI is performing exceptionally well with high accuracy predictions." :
                mlData.accuracy > 0.5 ?
                "AI is learning and improving its prediction accuracy." :
                "AI is in early learning phase, gathering data to improve predictions."
              }
            </p>
          </div>
          
          <div className="insight-card">
            <h4>🎯 Confidence Calibration</h4>
            <p>
              {mlData.confidenceCalibration > 1.1 ?
                "AI has gained confidence through successful predictions." :
                mlData.confidenceCalibration < 0.9 ?
                "AI has become more cautious after learning from errors." :
                "AI maintains balanced confidence in its predictions."
              }
            </p>
          </div>

          <div className="insight-card">
            <h4>🔄 Continuous Learning</h4>
            <p>
              The AI evaluates predictions after 7 days and adjusts its algorithms automatically. 
              Every analysis helps improve future accuracy.
            </p>
          </div>
        </div>
      </div>

      <button className="refresh-ml-btn" onClick={fetchMLPerformance}>
        🔄 Refresh AI Metrics
      </button>
    </div>
  );
}

export default MLDashboard;