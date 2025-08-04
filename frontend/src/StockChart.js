import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './StockChart.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ProfessionalStockChart({ stockData, technicalData, symbol }) {
  if (!stockData || stockData.length === 0) {
    return (
      <div className="professional-chart-placeholder">
        <div className="placeholder-content">
          <h3>📊 Professional Trading Chart</h3>
          <p>Loading chart data...</p>
          <div className="placeholder-features">
            <span>📈 Price Chart</span>
            <span>📊 Volume</span>
            <span>🎯 Technical Analysis</span>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const last30Days = stockData.slice(-30);
  const labels = last30Days.map(item => {
    const date = new Date(item.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // Price chart data
  const priceData = {
    labels: labels,
    datasets: [
      {
        label: `${symbol} Price`,
        data: last30Days.map(item => item.close),
        borderColor: '#00d4aa',
        backgroundColor: 'rgba(0, 212, 170, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00d4aa',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      // Moving Average 20
      ...(technicalData?.sma20 ? [{
        label: 'SMA 20',
        data: new Array(30).fill(parseFloat(technicalData.sma20)),
        borderColor: '#ff9500',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
      }] : []),
      // Moving Average 50
      ...(technicalData?.sma50 ? [{
        label: 'SMA 50',
        data: new Array(30).fill(parseFloat(technicalData.sma50)),
        borderColor: '#9c27b0',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [10, 5],
        pointRadius: 0,
        tension: 0,
      }] : [])
    ]
  };

  // Volume chart data
  const volumeData = {
    labels: labels,
    datasets: [
      {
        label: 'Volume',
        data: last30Days.map(item => item.volume || 0),
        backgroundColor: last30Days.map((item, index) => {
          const prevClose = index > 0 ? last30Days[index - 1].close : item.open;
          return item.close >= prevClose ? 'rgba(0, 212, 170, 0.7)' : 'rgba(255, 107, 107, 0.7)';
        }),
        borderColor: last30Days.map((item, index) => {
          const prevClose = index > 0 ? last30Days[index - 1].close : item.open;
          return item.close >= prevClose ? '#00d4aa' : '#ff6b6b';
        }),
        borderWidth: 1,
      }
    ]
  };

  const priceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#d1d4dc',
          font: { size: 11 }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#d1d4dc',
          font: { size: 11 },
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#d1d4dc',
          font: { size: 12, weight: 'bold' },
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: `${symbol} - Price Chart (Last 30 Days)`,
        color: '#ffffff',
        font: { size: 16, weight: 'bold' },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#00d4aa',
        borderWidth: 1,
        cornerRadius: 10,
        callbacks: {
          label: function(context) {
            if (context.datasetIndex === 0) {
              return `Price: $${context.parsed.y.toFixed(2)}`;
            }
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    }
  };

  const volumeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#d1d4dc',
          font: { size: 10 }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#d1d4dc',
          font: { size: 10 },
          callback: function(value) {
            return (value / 1000000).toFixed(1) + 'M';
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Trading Volume',
        color: '#d1d4dc',
        font: { size: 14, weight: 'bold' }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: function(context) {
            return `Volume: ${(context.parsed.y / 1000000).toFixed(2)}M`;
          }
        }
      }
    }
  };

  return (
    <div className="professional-stock-chart">
      {/* Chart Header */}
      <div className="pro-chart-header">
        <div className="chart-title-pro">
          <h3>📊 {symbol} Professional Chart</h3>
          <div className="chart-stats">
            <span className="stat">📈 {stockData.length} days data</span>
            <span className="stat">📊 Price + Volume</span>
            <span className="stat">⚡ Chart.js</span>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="pro-chart-container">
        <div className="chart-wrapper" style={{ height: '400px', marginBottom: '20px' }}>
          <Line data={priceData} options={priceOptions} />
        </div>
        
        {/* Volume Chart */}
        <div className="chart-wrapper" style={{ height: '200px' }}>
          <Bar data={volumeData} options={volumeOptions} />
        </div>
      </div>

      {/* Technical Indicators Panel */}
      {technicalData && (
        <div className="pro-indicators-panel">
          <div className="pro-indicators-grid">
            {/* RSI */}
            <div className="pro-indicator-box rsi-box">
              <div className="indicator-title">RSI (14)</div>
              <div className="rsi-container">
                <div className="rsi-value">{parseFloat(technicalData.rsi || 50).toFixed(1)}</div>
                <div className="rsi-visual-bar">
                  <div 
                    className="rsi-bar-fill" 
                    style={{ 
                      width: `${technicalData.rsi || 50}%`,
                      background: getRSIGradient(technicalData.rsi)
                    }}
                  ></div>
                  <div className="rsi-markers">
                    <span className="rsi-marker oversold">30</span>
                    <span className="rsi-marker overbought">70</span>
                  </div>
                </div>
                <div className="rsi-status">
                  {getRSIStatus(technicalData.rsi)}
                </div>
              </div>
            </div>

            {/* Volume Analysis */}
            <div className="pro-indicator-box">
              <div className="indicator-title">Volume Analysis</div>
              <div className="volume-analysis">
                <div className="volume-ratio">
                  Ratio: <span className={getVolumeClass(technicalData.volumeRatio)}>
                    {parseFloat(technicalData.volumeRatio || 1).toFixed(1)}x
                  </span>
                </div>
                <div className="volume-trend">
                  {getVolumeDescription(technicalData.volumeRatio)}
                </div>
              </div>
            </div>

            {/* Trend Analysis */}
            <div className="pro-indicator-box">
              <div className="indicator-title">Trend Analysis</div>
              <div className="trend-analysis">
                <div className={`trend-strength trend-${(technicalData.trend || 'NEUTRAL').toLowerCase()}`}>
                  {formatTrendPro(technicalData.trend || 'NEUTRAL')}
                </div>
                <div className="trend-confidence">
                  Market Direction Analysis
                </div>
              </div>
            </div>

            {/* Moving Averages */}
            {(technicalData.sma20 || technicalData.sma50) && (
              <div className="pro-indicator-box">
                <div className="indicator-title">Moving Averages</div>
                <div className="ma-analysis">
                  {technicalData.sma20 && (
                    <div className="ma-item">
                      <span className="ma-label">SMA 20:</span>
                      <span className="ma-value sma-20">${parseFloat(technicalData.sma20).toFixed(2)}</span>
                    </div>
                  )}
                  {technicalData.sma50 && (
                    <div className="ma-item">
                      <span className="ma-label">SMA 50:</span>
                      <span className="ma-value sma-50">${parseFloat(technicalData.sma50).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chart Legend */}
      <div className="chart-legend">
        <h4>📊 Chart Information</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color price-line"></div>
            <span>Price ({symbol})</span>
          </div>
          {technicalData?.sma20 && (
            <div className="legend-item">
              <div className="legend-color sma-20-line"></div>
              <span>SMA 20</span>
            </div>
          )}
          {technicalData?.sma50 && (
            <div className="legend-item">
              <div className="legend-color sma-50-line"></div>
              <span>SMA 50</span>
            </div>
          )}
          <div className="legend-item">
            <div className="legend-color volume-bar"></div>
            <span>Volume Bars</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Functions
const getRSIGradient = (rsi) => {
  const value = parseFloat(rsi || 50);
  if (value < 30) return 'linear-gradient(90deg, #27ae60, #2ecc71)';
  if (value > 70) return 'linear-gradient(90deg, #e74c3c, #c0392b)';
  return 'linear-gradient(90deg, #f39c12, #e67e22)';
};

const getRSIStatus = (rsi) => {
  const value = parseFloat(rsi || 50);
  if (value < 30) return '🟢 Oversold (Buy Signal)';
  if (value > 70) return '🔴 Overbought (Sell Signal)';
  if (value < 40) return '🟡 Bearish Territory';
  if (value > 60) return '🟡 Bullish Territory';
  return '⚪ Neutral Zone';
};

const getVolumeClass = (ratio) => {
  const value = parseFloat(ratio || 1);
  if (value > 1.5) return 'volume-high';
  if (value < 0.7) return 'volume-low';
  return 'volume-normal';
};

const getVolumeDescription = (ratio) => {
  const value = parseFloat(ratio || 1);
  if (value > 2) return '🔥 Extremely High Volume';
  if (value > 1.5) return '📈 High Volume Activity';
  if (value < 0.5) return '❄️ Very Low Volume';
  if (value < 0.7) return '📉 Below Average Volume';
  return '📊 Normal Volume Range';
};

const formatTrendPro = (trend) => {
  const trendMap = {
    'STRONG_UP': '🚀 Very Bullish',
    'UP': '📈 Bullish Trend',
    'NEUTRAL': '➡️ Sideways Movement',
    'DOWN': '📉 Bearish Trend',
    'STRONG_DOWN': '💥 Very Bearish'
  };
  return trendMap[trend] || trend;
};

export default ProfessionalStockChart;