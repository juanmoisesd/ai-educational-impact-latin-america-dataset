.PHONY: test install clean

test:
	python3 -m pytest tests/

install:
	pip install -r requirements.txt

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	rm -rf .pytest_cache
