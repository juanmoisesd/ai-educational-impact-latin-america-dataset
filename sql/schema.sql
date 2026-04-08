CREATE TABLE IF NOT EXISTS ai_education_impact (
    participant_id VARCHAR(255) PRIMARY KEY,
    country VARCHAR(100),
    academic_performance DECIMAL(5, 2),
    motivation_score DECIMAL(3, 2),
    self_regulation_score DECIMAL(3, 2)
);
