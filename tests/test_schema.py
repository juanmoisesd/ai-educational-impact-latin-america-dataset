import json
import jsonschema
import os

def test_schema_exists():
    assert os.path.exists("schema.json")

def test_validate_sample_data():
    with open("schema.json", "r") as f:
        schema = json.load(f)

    sample_data = {
        "participant_id": "P001",
        "country": "Mexico",
        "academic_performance": 85.5,
        "motivation_score": 4.0,
        "self_regulation_score": 3.5
    }

    jsonschema.validate(instance=sample_data, schema=schema)
