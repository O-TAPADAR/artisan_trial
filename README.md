# Artisan Trial

This project is a chat application with a frontend built using React and TypeScript and a backend built using Python and FastAPI. The application also includes automated testing using `pytest`.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)

## Features

1. **Real-time Chat:** Engage in seamless, real-time conversations (echo-ing bot).
2. **Inline Edit/Delete:** Edit or delete messages with options appearing on hover.
3. **Add Conversations:** Allows for multiple conversations at the same.
4. **Modern Tech Stack:** Built with React, TypeScript, and FastAPI.
5. **Automated Testing:** Ensures reliability with pytest.

## Installation

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/O-TAPADAR/artisan_trial.git
   cd artisan_trial/server

2. Set up a Python virtual environment:

   ```bash
   python -m venv venv

3. Activate the virtual environment:

   ```bash
   source venv/bin/activate

4. Install the Python dependencies:

   ```bash
   pip install -r requirements.txt

### Frontend Setup

1. Navigate to the client directory:

   ```bash
   cd client

2. Install the Node.js dependencies:

   ```bash
   npm install

## Running the Application

### Backend

1. Start the FastAPI server:

   ```bash
   uvicorn main:app --reload

2. The API will be available at http://127.0.0.1:8000.

### Frontend

1. Navigate to the client directory:

   ```bash
   cd client

2. Start the React application:

   ```bash
   npm start

3. The frontend will be available at http://localhost:3000.

## Running Tests

### Pytest
To run the automated tests:
1. Ensure your virtual environment is activated.
2. Run the tests using pytest:

   ```bash
   pytest test_main.py

## Project Structure

```plaintext
artisan_trial/
│
├── server/                       # Backend directory
│   ├── main.py                   # FastAPI application
│   ├── models.py                 # SQLModel models
│   ├── schemas.py                # Pydantic schemas
│   ├── database.py               # Database configuration
│   ├── test_main.py              # Backend tests
│   └── requirements.txt          # Backend dependencies
│
├── client/                       # Frontend directory
│   ├── src/
│   │   ├── App.tsx               # Main React component
│   │   ├── index.tsx             # React entry point
│   │   └── ...                   # Other frontend components and files
│   ├── package.json              # Frontend dependencies
│   └── package-lock.json         # Dependency lock files
│
└── README.md                     # Project documentation
