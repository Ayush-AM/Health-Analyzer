import React, { useState } from 'react';
import { 
  getBMIColor, 
  getHealthScoreColor, 
  getHealthScoreCategory,
  formatDate,
  getRiskLevel,
  generateRecommendations
} from '../utils/healthUtils';
import './HealthRecordCard.css';

const HealthRecordCard = ({ record, onDelete, onEdit }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const riskLevel = getRiskLevel(record);
  const recommendations = generateRecommendations(record);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleRecommendations = () => {
    setShowRecommendations(!showRecommendations);
  };

  return (
    <div className="health-record-card">
      {/* Card Header */}
      <div className="card-header">
        <div className="patient-info">
          <h3 className="patient-name">{record.name}</h3>
          <p className="patient-details">
            {record.age} years old • {record.gender}
          </p>
        </div>
        <div className="card-actions">
          <button 
            className="action-btn edit-btn"
            onClick={onEdit}
            title="Edit Record"
          >
            ✏️
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={onDelete}
            title="Delete Record"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* BMI Section */}
      <div className="bmi-section">
        <div className="metric-item">
          <label>BMI</label>
          <div className="bmi-display">
            <span className="bmi-value">{record.bmi.value}</span>
            <span 
              className="bmi-category"
              style={{ backgroundColor: getBMIColor(record.bmi.category) }}
            >
              {record.bmi.category}
            </span>
          </div>
        </div>
        
        <div className="metric-item">
          <label>Health Score</label>
          <div className="health-score-display">
            <span 
              className="health-score-value"
              style={{ color: getHealthScoreColor(record.healthScore) }}
            >
              {record.healthScore}/100
            </span>
            <span className="health-score-category">
              {getHealthScoreCategory(record.healthScore)}
            </span>
          </div>
        </div>

        <div className="metric-item">
          <label>Risk Level</label>
          <span 
            className="risk-level"
            style={{ color: riskLevel.color }}
          >
            {riskLevel.level}
          </span>
        </div>
      </div>

      {/* Physical Measurements */}
      <div className="measurements-section">
        <div className="measurement">
          <span className="measurement-label">Weight</span>
          <span className="measurement-value">{record.weight} kg</span>
        </div>
        <div className="measurement">
          <span className="measurement-label">Height</span>
          <span className="measurement-value">{record.height} cm</span>
        </div>
      </div>

      {/* Contact Information */}
      <div className="contact-section">
        <div className="contact-item">
          <span className="contact-icon">📧</span>
          <span className="contact-value">{record.email}</span>
        </div>
        <div className="contact-item">
          <span className="contact-icon">📞</span>
          <span className="contact-value">{record.contact}</span>
        </div>
      </div>

      {/* Health Issues */}
      {record.existingHealthIssues && record.existingHealthIssues.length > 0 && (
        <div className="health-issues-section">
          <label>Health Issues</label>
          <div className="health-issues-list">
            {record.existingHealthIssues.slice(0, 3).map((issue, index) => (
              <span key={index} className="health-issue-tag">
                {issue}
              </span>
            ))}
            {record.existingHealthIssues.length > 3 && (
              <span className="health-issue-tag more">
                +{record.existingHealthIssues.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="card-footer">
        <button 
          className="btn btn-secondary btn-small"
          onClick={toggleDetails}
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
        
        {recommendations.length > 0 && (
          <button 
            className="btn btn-info btn-small"
            onClick={toggleRecommendations}
          >
            💡 Recommendations ({recommendations.length})
          </button>
        )}
        
        <div className="record-date">
          <span className="date-label">Created:</span>
          <span className="date-value">{formatDate(record.createdAt)}</span>
        </div>
      </div>

      {/* Detailed Information (Collapsible) */}
      {showDetails && (
        <div className="details-section">
          <h4>Lifestyle Habits</h4>
          <div className="lifestyle-grid">
            <div className="lifestyle-item">
              <label>Exercise</label>
              <span>{record.lifestyleHabits.exercise.frequency}</span>
              {record.lifestyleHabits.exercise.type !== 'None' && (
                <small>({record.lifestyleHabits.exercise.type})</small>
              )}
            </div>
            
            <div className="lifestyle-item">
              <label>Smoking</label>
              <span>{record.lifestyleHabits.smoking}</span>
            </div>
            
            <div className="lifestyle-item">
              <label>Alcohol</label>
              <span>{record.lifestyleHabits.alcohol}</span>
            </div>
            
            <div className="lifestyle-item">
              <label>Sleep</label>
              <span>
                {record.lifestyleHabits.sleep.hoursPerNight}h/night 
                ({record.lifestyleHabits.sleep.quality})
              </span>
            </div>
            
            <div className="lifestyle-item">
              <label>Diet</label>
              <span>{record.lifestyleHabits.diet}</span>
            </div>
            
            <div className="lifestyle-item">
              <label>Water Intake</label>
              <span>{record.lifestyleHabits.waterIntake} glasses/day</span>
            </div>
          </div>
          
          {record.notes && (
            <div className="notes-section">
              <h4>Notes</h4>
              <p className="notes-text">{record.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Recommendations (Collapsible) */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="recommendations-section">
          <h4>Health Recommendations</h4>
          <div className="recommendations-list">
            {recommendations.map((rec, index) => (
              <div 
                key={index} 
                className={`recommendation-item priority-${rec.priority}`}
              >
                <span className="rec-icon">{rec.icon}</span>
                <span className="rec-text">{rec.text}</span>
                <span className={`rec-priority priority-${rec.priority}`}>
                  {rec.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecordCard;
