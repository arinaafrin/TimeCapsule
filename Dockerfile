FROM python:3.10-slim

WORKDIR /app

# Copy requirements from the backend subfolder
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files from the backend subfolder into the container
COPY backend/ .

# Expose port 8080 for Back4app
EXPOSE 8080

# Overwrite default startup to force port 8080 and global binding
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]