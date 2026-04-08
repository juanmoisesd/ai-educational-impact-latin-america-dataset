import pandas as pd
import numpy as np

# Set seed for reproducibility
np.random.seed(42)

countries = ["Mexico", "Colombia", "Argentina", "Peru", "Chile", "Brazil"]
n_samples = 200

data = {
    "participant_id": [f"P{i:03d}" for i in range(1, n_samples + 1)],
    "country": np.random.choice(countries, n_samples),
    "academic_performance": np.random.normal(75, 10, n_samples).clip(0, 100),
    "motivation_score": np.random.normal(3.5, 0.8, n_samples).clip(1, 5),
    "self_regulation_score": np.random.normal(3.8, 0.7, n_samples).clip(1, 5),
    "ai_usage_frequency": np.random.randint(1, 6, n_samples)
}

df = pd.DataFrame(data)
df.to_csv("data/analysis_ready/dataset_final.csv", index=False)
print("Sample dataset created successfully.")
