// BMI calculation and category determination
export const calculateBMI = (weight, height) => {
    if (!weight || !height || weight <= 0 || height <= 0) {
        return null;
    }
    
    // Convert height from cm to meters
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    return parseFloat(bmi.toFixed(2));
};

export const getBMICategory = (bmi) => {
    if (!bmi || bmi <= 0) return 'Unknown';
    
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
};

export const getBMIColor = (category) => {
    switch (category) {
        case 'Underweight':
            return '#3B82F6'; // Blue
        case 'Normal':
            return '#10B981'; // Green
        case 'Overweight':
            return '#F59E0B'; // Yellow
        case 'Obese':
            return '#EF4444'; // Red
        default:
            return '#6B7280'; // Gray
    }
};

// Health score color and interpretation
export const getHealthScoreColor = (score) => {
    if (score >= 80) return '#10B981'; // Green - Excellent
    if (score >= 65) return '#F59E0B'; // Yellow - Good
    if (score >= 50) return '#F97316'; // Orange - Fair
    return '#EF4444'; // Red - Poor
};

export const getHealthScoreCategory = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
};

// Form validation functions
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
};

export const validateAge = (age) => {
    return age >= 1 && age <= 120;
};

export const validateWeight = (weight) => {
    return weight > 0 && weight <= 1000;
};

export const validateHeight = (height) => {
    return height >= 30 && height <= 300;
};

// Format date for display
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Get risk level based on various health factors
export const getRiskLevel = (healthRecord) => {
    let riskScore = 0;
    
    // BMI risk
    const bmiCategory = getBMICategory(healthRecord.bmi?.value);
    if (bmiCategory === 'Obese') riskScore += 3;
    else if (bmiCategory === 'Overweight') riskScore += 2;
    else if (bmiCategory === 'Underweight') riskScore += 1;
    
    // Age risk
    if (healthRecord.age > 65) riskScore += 2;
    else if (healthRecord.age > 50) riskScore += 1;
    
    // Smoking risk
    if (healthRecord.lifestyleHabits?.smoking === 'Regular') riskScore += 3;
    else if (healthRecord.lifestyleHabits?.smoking === 'Occasional') riskScore += 1;
    
    // Exercise risk
    const exerciseFreq = healthRecord.lifestyleHabits?.exercise?.frequency;
    if (exerciseFreq === 'Never') riskScore += 2;
    else if (exerciseFreq === 'Rarely') riskScore += 1;
    
    // Sleep risk
    const sleepHours = healthRecord.lifestyleHabits?.sleep?.hoursPerNight;
    if (sleepHours < 6 || sleepHours > 10) riskScore += 1;
    
    // Health issues risk
    const healthIssues = healthRecord.existingHealthIssues || [];
    if (healthIssues.length > 0 && !(healthIssues.length === 1 && healthIssues[0] === 'None')) {
        riskScore += healthIssues.length;
    }
    
    // Determine risk level
    if (riskScore >= 6) return { level: 'High', color: '#EF4444' };
    if (riskScore >= 3) return { level: 'Medium', color: '#F59E0B' };
    return { level: 'Low', color: '#10B981' };
};

// Constants for form options
export const HEALTH_ISSUES_OPTIONS = [
    'Diabetes',
    'Hypertension',
    'Heart Disease',
    'Asthma',
    'Arthritis',
    'Depression',
    'Anxiety',
    'High Cholesterol',
    'Thyroid Issues',
    'Kidney Disease',
    'Liver Disease',
    'Cancer',
    'Obesity',
    'Osteoporosis',
    'None'
];

export const EXERCISE_FREQUENCIES = [
    'Never',
    'Rarely',
    '1-2 times/week',
    '3-4 times/week',
    '5+ times/week'
];

export const EXERCISE_TYPES = [
    'None',
    'Cardio',
    'Strength Training',
    'Yoga',
    'Sports',
    'Walking',
    'Mixed'
];

export const SMOKING_OPTIONS = [
    'Never',
    'Former Smoker',
    'Occasional',
    'Regular'
];

export const ALCOHOL_OPTIONS = [
    'Never',
    'Occasionally',
    'Socially',
    'Regularly',
    'Daily'
];

export const SLEEP_QUALITY_OPTIONS = [
    'Poor',
    'Fair',
    'Good',
    'Excellent'
];

export const DIET_OPTIONS = [
    'Omnivore',
    'Vegetarian',
    'Vegan',
    'Keto',
    'Mediterranean',
    'Other'
];

export const GENDER_OPTIONS = [
    'Male',
    'Female',
    'Other'
];

// Generate health recommendations based on user data
export const generateRecommendations = (healthRecord) => {
    const recommendations = [];
    const bmiCategory = getBMICategory(healthRecord.bmi?.value);
    
    // BMI recommendations
    if (bmiCategory === 'Overweight' || bmiCategory === 'Obese') {
        recommendations.push({
            type: 'weight',
            priority: 'high',
            text: 'Consider a balanced diet and regular exercise to achieve healthy weight',
            icon: '⚖️'
        });
    } else if (bmiCategory === 'Underweight') {
        recommendations.push({
            type: 'weight',
            priority: 'medium',
            text: 'Consider consulting a nutritionist to gain healthy weight',
            icon: '🍎'
        });
    }
    
    // Exercise recommendations
    const exerciseFreq = healthRecord.lifestyleHabits?.exercise?.frequency;
    if (exerciseFreq === 'Never' || exerciseFreq === 'Rarely') {
        recommendations.push({
            type: 'exercise',
            priority: 'high',
            text: 'Aim for at least 150 minutes of moderate exercise per week',
            icon: '🏃‍♂️'
        });
    }
    
    // Smoking recommendations
    if (healthRecord.lifestyleHabits?.smoking !== 'Never') {
        recommendations.push({
            type: 'smoking',
            priority: 'high',
            text: 'Consider quitting smoking for better health',
            icon: '🚭'
        });
    }
    
    // Sleep recommendations
    const sleepHours = healthRecord.lifestyleHabits?.sleep?.hoursPerNight;
    if (sleepHours < 7) {
        recommendations.push({
            type: 'sleep',
            priority: 'medium',
            text: 'Aim for 7-9 hours of quality sleep per night',
            icon: '😴'
        });
    }
    
    // Water intake recommendations
    if (healthRecord.lifestyleHabits?.waterIntake < 8) {
        recommendations.push({
            type: 'hydration',
            priority: 'medium',
            text: 'Increase daily water intake to at least 8 glasses',
            icon: '💧'
        });
    }
    
    return recommendations;
};
