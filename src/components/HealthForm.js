import React, { useState, useEffect } from 'react';
import { healthAPI } from '../services/api';
import { 
  calculateBMI, 
  getBMICategory, 
  validateEmail, 
  validatePhone, 
  validateAge, 
  validateWeight, 
  validateHeight,
  HEALTH_ISSUES_OPTIONS,
  EXERCISE_FREQUENCIES,
  EXERCISE_TYPES,
  SMOKING_OPTIONS,
  ALCOHOL_OPTIONS,
  SLEEP_QUALITY_OPTIONS,
  DIET_OPTIONS,
  GENDER_OPTIONS
} from '../utils/healthUtils';
import './HealthForm.css';

const HealthForm = ({ onSuccess, onCancel, editRecord = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    email: '',
    contact: '',
    existingHealthIssues: [],
    lifestyleHabits: {
      exercise: {
        frequency: 'Never',
        type: 'None'
      },
      smoking: 'Never',
      alcohol: 'Never',
      sleep: {
        hoursPerNight: 7,
        quality: 'Good'
      },
      diet: 'Omnivore',
      waterIntake: 8
    },
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [calculatedBMI, setCalculatedBMI] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (editRecord) {
      setFormData({
        name: editRecord.name || '',
        age: editRecord.age || '',
        gender: editRecord.gender || '',
        weight: editRecord.weight || '',
        height: editRecord.height || '',
        email: editRecord.email || '',
        contact: editRecord.contact || '',
        existingHealthIssues: editRecord.existingHealthIssues || [],
        lifestyleHabits: editRecord.lifestyleHabits || formData.lifestyleHabits,
        notes: editRecord.notes || ''
      });
    }
  }, [editRecord]);

  // Calculate BMI when weight or height changes
  useEffect(() => {
    if (formData.weight && formData.height) {
      const bmi = calculateBMI(parseFloat(formData.weight), parseFloat(formData.height));
      if (bmi) {
        setCalculatedBMI(bmi);
        setBmiCategory(getBMICategory(bmi));
      }
    } else {
      setCalculatedBMI(null);
      setBmiCategory('');
    }
  }, [formData.weight, formData.height]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested object properties
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = type === 'number' ? parseFloat(value) || 0 : value;
        return newData;
      });
    } else if (name === 'existingHealthIssues') {
      // Handle multi-select health issues
      setFormData(prev => ({
        ...prev,
        existingHealthIssues: checked
          ? [...prev.existingHealthIssues, value]
          : prev.existingHealthIssues.filter(issue => issue !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validations
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || !validateAge(formData.age)) newErrors.age = 'Valid age (1-120) is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.weight || !validateWeight(formData.weight)) newErrors.weight = 'Valid weight (1-1000 kg) is required';
    if (!formData.height || !validateHeight(formData.height)) newErrors.height = 'Valid height (30-300 cm) is required';
    if (!formData.email || !validateEmail(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.contact || !validatePhone(formData.contact)) newErrors.contact = 'Valid contact number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      if (editRecord) {
        await healthAPI.update(editRecord._id, formData);
      } else {
        await healthAPI.create(formData);
      }
      
      onSuccess && onSuccess();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleHealthIssueToggle = (issue) => {
    setFormData(prev => {
      const currentIssues = prev.existingHealthIssues;
      const isSelected = currentIssues.includes(issue);
      
      if (issue === 'None') {
        // If selecting 'None', clear all other selections
        return {
          ...prev,
          existingHealthIssues: isSelected ? [] : ['None']
        };
      } else {
        // If selecting any other issue, remove 'None' if present
        const updatedIssues = isSelected
          ? currentIssues.filter(i => i !== issue)
          : [...currentIssues.filter(i => i !== 'None'), issue];
        
        return {
          ...prev,
          existingHealthIssues: updatedIssues
        };
      }
    });
  };

  return (
    <div className="health-form-container">
      <div className="health-form-header">
        <h2>{editRecord ? 'Edit Health Record' : 'Add New Health Record'}</h2>
        <p>Please fill out all the required information to create your health profile.</p>
      </div>

      <form onSubmit={handleSubmit} className="health-form">
        {/* Personal Information */}
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter your full name"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="age">Age *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={errors.age ? 'error' : ''}
                placeholder="Enter your age"
                min="1"
                max="120"
              />
              {errors.age && <span className="error-text">{errors.age}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={errors.gender ? 'error' : ''}
              >
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="contact">Contact Number *</label>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className={errors.contact ? 'error' : ''}
                placeholder="Enter your contact number"
              />
              {errors.contact && <span className="error-text">{errors.contact}</span>}
            </div>
          </div>
        </div>

        {/* Physical Measurements */}
        <div className="form-section">
          <h3>Physical Measurements</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="weight">Weight (kg) *</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className={errors.weight ? 'error' : ''}
                placeholder="Enter your weight"
                step="0.1"
                min="1"
                max="1000"
              />
              {errors.weight && <span className="error-text">{errors.weight}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="height">Height (cm) *</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className={errors.height ? 'error' : ''}
                placeholder="Enter your height"
                step="0.1"
                min="30"
                max="300"
              />
              {errors.height && <span className="error-text">{errors.height}</span>}
            </div>

            {calculatedBMI && (
              <div className="bmi-display">
                <h4>Calculated BMI</h4>
                <div className="bmi-value">
                  <span className="bmi-number">{calculatedBMI}</span>
                  <span className={`bmi-category ${bmiCategory.toLowerCase()}`}>
                    {bmiCategory}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Health Issues */}
        <div className="form-section">
          <h3>Existing Health Issues</h3>
          <p className="section-description">Select all that apply (choose 'None' if no health issues)</p>
          <div className="checkbox-grid">
            {HEALTH_ISSUES_OPTIONS.map(issue => (
              <label key={issue} className="checkbox-label">
                <input
                  type="checkbox"
                  value={issue}
                  checked={formData.existingHealthIssues.includes(issue)}
                  onChange={() => handleHealthIssueToggle(issue)}
                />
                <span className="checkbox-text">{issue}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Lifestyle Habits */}
        <div className="form-section">
          <h3>Lifestyle Habits</h3>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="exercise.frequency">Exercise Frequency</label>
              <select
                id="exercise.frequency"
                name="lifestyleHabits.exercise.frequency"
                value={formData.lifestyleHabits.exercise.frequency}
                onChange={handleInputChange}
              >
                {EXERCISE_FREQUENCIES.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="exercise.type">Exercise Type</label>
              <select
                id="exercise.type"
                name="lifestyleHabits.exercise.type"
                value={formData.lifestyleHabits.exercise.type}
                onChange={handleInputChange}
              >
                {EXERCISE_TYPES.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="smoking">Smoking Status</label>
              <select
                id="smoking"
                name="lifestyleHabits.smoking"
                value={formData.lifestyleHabits.smoking}
                onChange={handleInputChange}
              >
                {SMOKING_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="alcohol">Alcohol Consumption</label>
              <select
                id="alcohol"
                name="lifestyleHabits.alcohol"
                value={formData.lifestyleHabits.alcohol}
                onChange={handleInputChange}
              >
                {ALCOHOL_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="sleep.hoursPerNight">Sleep Hours per Night</label>
              <input
                type="number"
                id="sleep.hoursPerNight"
                name="lifestyleHabits.sleep.hoursPerNight"
                value={formData.lifestyleHabits.sleep.hoursPerNight}
                onChange={handleInputChange}
                min="0"
                max="24"
                step="0.5"
              />
            </div>

            <div className="form-field">
              <label htmlFor="sleep.quality">Sleep Quality</label>
              <select
                id="sleep.quality"
                name="lifestyleHabits.sleep.quality"
                value={formData.lifestyleHabits.sleep.quality}
                onChange={handleInputChange}
              >
                {SLEEP_QUALITY_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="diet">Diet Type</label>
              <select
                id="diet"
                name="lifestyleHabits.diet"
                value={formData.lifestyleHabits.diet}
                onChange={handleInputChange}
              >
                {DIET_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="waterIntake">Daily Water Intake (glasses)</label>
              <input
                type="number"
                id="waterIntake"
                name="lifestyleHabits.waterIntake"
                value={formData.lifestyleHabits.waterIntake}
                onChange={handleInputChange}
                min="0"
                max="20"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="form-section">
          <h3>Additional Notes</h3>
          <div className="form-field">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional health information or notes..."
              rows="4"
              maxLength="500"
            />
            <small>{formData.notes.length}/500 characters</small>
          </div>
        </div>

        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (editRecord ? 'Update Record' : 'Create Record')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthForm;
