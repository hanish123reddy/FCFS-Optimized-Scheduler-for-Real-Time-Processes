# Dynamic Predictive FCFS (DP-FCFS)

## Project Name
Dynamic Predictive FCFS (DP-FCFS): An Intelligent Cloud Task Scheduling and Visualization System Using First Come First Serve (FCFS)

## Project Description
DP-FCFS is an intelligent cloud task scheduling and visualization system. It implements the First Come First Serve (FCFS) scheduling algorithm, enhanced with predictive features to analyze and visualize task execution and queue dynamics in a cloud environment.

## Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router DOM, Framer Motion, Chart.js, Axios, Lucide React
- **Backend**: Python Flask
- **Database**: SQLite
- **Version Control**: Git, GitHub

## Folder Structure
```text
DP-FCFS/
├── frontend/        # React (Vite) application
├── backend/         # Python Flask application
├── docs/            # Project documentation
├── assets/          # Static assets
├── README.md        # Project documentation
├── .gitignore       # Git ignore rules
└── LICENSE          # Project license
```

## Installation Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.8+)

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Flask application:
   ```bash
   python app.py
   ```

## Future Modules
- Task Management & Queueing (FCFS implementation)
- Real-time Analytics & Visualizations
- Predictive Scheduling Models
- Performance Reporting
