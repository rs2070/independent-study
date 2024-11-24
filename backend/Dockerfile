# Use an official lightweight Python image.
FROM python:3.8-slim

# Set the working directory to /app
WORKDIR /app

# Install Flask
COPY requirements.txt ./
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Make this port available to the world outside this container
EXPOSE 5000

# Define an entry point, defaulting to Flask run
ENTRYPOINT ["flask"]
CMD ["run", "--host=0.0.0.0", "--port=5000"]
