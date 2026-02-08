FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY pyproject.toml ./

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -e .

# Copy application
COPY . .

# Create uploads directory
RUN mkdir -p /uploads && chmod 755 /uploads

# Expose port
EXPOSE 8000

# Start command
CMD ["python", "-m", "app.main"]