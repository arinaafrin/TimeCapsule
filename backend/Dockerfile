# Use an official lightweight Python runtime
FROM python:3.10-slim

# Set the working directory inside the cloud container
WORKDIR /app

# Copy dependency definitions and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend source code
COPY . .

# Expose the internal port 
EXPOSE 8080

# Run the FastAPI server using uvicorn directly
CMD ["python", "main.py"]