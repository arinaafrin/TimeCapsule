# 1. Use an official Python runtime
FROM python:3.10-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy requirements from the backend subfolder
COPY backend/requirements.txt .

# 4. Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy all files from the backend subfolder into the container root
COPY backend/ .

# 6. Expose the port FastAPI runs on
EXPOSE 8080

# 7. Run the application
CMD ["python", "main.py"]