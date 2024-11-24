# Python backend
FROM python:3.8-slim as backend-base
WORKDIR /app
COPY ./backend/requirements.txt ./
RUN pip install --upgrade pip && \
    pip install -r requirements.txt
COPY ./backend /app
EXPOSE 5000
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]

# Node.js frontend
FROM node:14 as frontend-base
WORKDIR /app
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend ./
RUN npm run build
CMD ["npm", "start"]
EXPOSE 3000
