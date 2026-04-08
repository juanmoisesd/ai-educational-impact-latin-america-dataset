#!/bin/bash
set -e

echo "Starting data validation and analysis pipeline..."

# Install dependencies
pip install -r requirements.txt

# Run tests
make test

echo "Pipeline completed successfully."
