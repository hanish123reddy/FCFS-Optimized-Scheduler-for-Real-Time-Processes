# DP-FCFS Project
## Task 03 – Backend Architecture

# Objective

Build a clean, scalable Flask backend architecture for the DP-FCFS project.

The backend should be production-ready and prepared for future implementation of FCFS scheduling, prediction algorithms, and database integration.

Do NOT implement any scheduling logic.

Do NOT implement any prediction logic.

Do NOT create database models.

This task only focuses on backend architecture and frontend-backend communication.

---

# Technology

Backend

- Python 3
- Flask
- Flask-CORS

Frontend

- React
- Axios

---

# Install Required Packages

Install

- Flask
- Flask-CORS

Update requirements.txt accordingly.

---

# Backend Structure

Ensure the backend contains

backend/

app.py

config.py

routes.py

scheduler.py

predictor.py

database.py

models.py

requirements.txt

---

# Flask Application

Configure

- Flask App
- CORS
- Environment Configuration

The application should be modular and easy to extend.

---

# API Structure

Create the following REST API endpoints.

GET /

Returns

{
    "project": "Dynamic Predictive FCFS",
    "status": "Running"
}

---

GET /api/health

Returns

{
    "status": "healthy"
}

---

GET /api/version

Returns

{
    "version": "1.0.0"
}

---

GET /api/tasks

Return an empty list.

[]

---

POST /api/tasks

Accept JSON data.

Return

{
    "message": "Task received"
}

Do NOT save data.

---

DELETE /api/tasks/<id>

Return

{
    "message": "Task deleted"
}

No database operations.

---

# Error Handling

Create

404 response

500 response

JSON format only.

---

# Frontend Integration

Using Axios,

connect React to

GET /api/health

Display backend status on the Dashboard.

For example

Backend Status

🟢 Online

No additional API calls.

---

# Folder Organization

Organize routes cleanly.

Separate configuration from application startup.

Keep the code modular.

---

# Documentation

Add comments explaining

- API purpose
- Route purpose
- Folder purpose

---

# Code Quality

Use

- Clean architecture
- Modular design
- Readable code
- Proper naming conventions

---

# Important Rules

Do NOT implement FCFS scheduling.

Do NOT implement prediction algorithms.

Do NOT calculate waiting time.

Do NOT calculate turnaround time.

Do NOT create SQLite tables.

Do NOT implement authentication.

Do NOT create dashboards with real data.

Only create the backend architecture and verify communication between React and Flask.