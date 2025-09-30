import React from 'react';
import { getBMIColor } from '../utils/healthUtils';
import './HealthStats.css';

const HealthStats = ({ stats }) => {
  if (!stats) return null;

  const {
    totalRecords,
    bmiDistribution,
    ageDistribution,
    genderDistribution,
    healthScoreStats
  } = stats;

  return (
    <div className="health-stats">
      <h2 className="stats-title">Health Overview</h2>
      
      <div className="stats-grid">
        {/* Total Records */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">👥</span>
            <h3>Total Records</h3>
          </div>
          <div className="stat-value large">{totalRecords}</div>
          <p className="stat-description">Health records in database</p>
        </div>

        {/* Average Health Score */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">📊</span>
            <h3>Average Health Score</h3>
          </div>
          <div className="stat-value large">
            {healthScoreStats.averageScore ? Math.round(healthScoreStats.averageScore) : 0}
            <span className="stat-unit">/100</span>
          </div>
          <p className="stat-description">
            Range: {healthScoreStats.minScore || 0} - {healthScoreStats.maxScore || 0}
          </p>
        </div>

        {/* BMI Distribution */}
        <div className="stat-card wide">
          <div className="stat-header">
            <span className="stat-icon">⚖️</span>
            <h3>BMI Distribution</h3>
          </div>
          <div className="distribution-chart">
            {bmiDistribution && bmiDistribution.length > 0 ? (
              bmiDistribution.map((item, index) => (
                <div key={index} className="distribution-item">
                  <div 
                    className="distribution-bar"
                    style={{ 
                      backgroundColor: getBMIColor(item._id),
                      width: `${(item.count / totalRecords) * 100}%`
                    }}
                  ></div>
                  <div className="distribution-label">
                    <span className="category">{item._id}</span>
                    <span className="count">
                      {item.count} ({Math.round((item.count / totalRecords) * 100)}%)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No BMI data available</p>
            )}
          </div>
        </div>

        {/* Age Distribution */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">🎂</span>
            <h3>Age Groups</h3>
          </div>
          <div className="age-distribution">
            {ageDistribution && ageDistribution.length > 0 ? (
              ageDistribution.map((item, index) => (
                <div key={index} className="age-group-item">
                  <span className="age-group-label">{item._id}</span>
                  <div className="age-group-bar-container">
                    <div 
                      className="age-group-bar"
                      style={{ width: `${(item.count / totalRecords) * 100}%` }}
                    ></div>
                  </div>
                  <span className="age-group-count">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="no-data">No age data available</p>
            )}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">⚥</span>
            <h3>Gender Distribution</h3>
          </div>
          <div className="gender-distribution">
            {genderDistribution && genderDistribution.length > 0 ? (
              genderDistribution.map((item, index) => (
                <div key={index} className="gender-item">
                  <div className="gender-info">
                    <span className="gender-label">{item._id}</span>
                    <span className="gender-percentage">
                      {Math.round((item.count / totalRecords) * 100)}%
                    </span>
                  </div>
                  <div className="gender-bar-container">
                    <div 
                      className={`gender-bar gender-${item._id.toLowerCase()}`}
                      style={{ width: `${(item.count / totalRecords) * 100}%` }}
                    ></div>
                  </div>
                  <span className="gender-count">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="no-data">No gender data available</p>
            )}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="stat-card wide insights">
          <div className="stat-header">
            <span className="stat-icon">💡</span>
            <h3>Quick Insights</h3>
          </div>
          <div className="insights-list">
            {bmiDistribution && bmiDistribution.length > 0 && (
              <>
                {(() => {
                  const normalBMI = bmiDistribution.find(item => item._id === 'Normal');
                  const overweightBMI = bmiDistribution.find(item => item._id === 'Overweight');
                  const obeseBMI = bmiDistribution.find(item => item._id === 'Obese');
                  
                  const normalPercentage = normalBMI ? Math.round((normalBMI.count / totalRecords) * 100) : 0;
                  const overweightPercentage = overweightBMI ? Math.round((overweightBMI.count / totalRecords) * 100) : 0;
                  const obesePercentage = obeseBMI ? Math.round((obeseBMI.count / totalRecords) * 100) : 0;
                  
                  return (
                    <>
                      <div className="insight-item">
                        <span className="insight-icon">✅</span>
                        <span className="insight-text">
                          {normalPercentage}% of users have a normal BMI
                        </span>
                      </div>
                      {(overweightPercentage + obesePercentage) > 50 && (
                        <div className="insight-item warning">
                          <span className="insight-icon">⚠️</span>
                          <span className="insight-text">
                            {overweightPercentage + obesePercentage}% of users are above normal weight
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}
            
            {healthScoreStats.averageScore && (
              <div className="insight-item">
                <span className="insight-icon">📈</span>
                <span className="insight-text">
                  Average health score is {healthScoreStats.averageScore >= 70 ? 'good' : 'needs improvement'}
                </span>
              </div>
            )}
            
            <div className="insight-item">
              <span className="insight-icon">👥</span>
              <span className="insight-text">
                {totalRecords} {totalRecords === 1 ? 'person is' : 'people are'} actively tracking their health
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStats;
