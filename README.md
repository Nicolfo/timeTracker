# Time Tracker

A comprehensive time tracking application designed to help users monitor and manage their work hours efficiently.

## Overview

Time Tracker is a full-stack web application that allows users to:

- Track work sessions with start/stop functionality
- View current work status (working/not working)
- Make manual time entries for past work periods
- Fix automatically generated timestamps
- View daily summaries of work time
- View weekly summaries with a visual histogram
- Identify when work exceeds 8 hours or occurs on weekends/holidays

## Architecture

### Frontend
- Built with React and TypeScript
- Uses React Bootstrap for UI components
- Features responsive design with interactive components
- Provides visual representations of work time through histograms

### Backend
- Built with Spring Boot
- Uses OAuth2 with Keycloak for authentication
- PostgreSQL database for data persistence
- RESTful API for communication with the frontend

## Deployment Options

### Local Development
1. Clone the repository
2. Start the database:
   ```
   docker-compose up -d
   ```
3. Run the backend:
   ```
   cd backend
   ./gradlew bootRun
   ```
4. Run the frontend:
   ```
   cd frontend
   npm install
   npm start
   ```

### Production Deployment
The application is configured for deployment to Kubernetes using Helm:

1. Build and push Docker images:
   ```
   # Build frontend
   cd frontend
   docker build -t registry.example.com/timetracker-frontend:latest .
   docker push registry.example.com/timetracker-frontend:latest

   # Build backend
   cd backend
   ./gradlew bootBuildImage --imageName=registry.example.com/timetracker-backend:latest
   docker push registry.example.com/timetracker-backend:latest
   ```

2. Deploy using Helm:
   ```
   cd time-tracker
   helm install time-tracker . --values values.yaml
   ```

## Configuration

### Backend Configuration
The backend can be configured through `application.properties` or environment variables:
- Database connection settings
- OAuth2/Keycloak settings
- Application URLs

### Frontend Configuration
The frontend connects to the backend API and can be configured through environment variables.

## Features

### Time Tracking
- One-click start/stop tracking
- Manual entry for forgotten time periods
- Automatic detection of work patterns

### Reporting
- Daily summaries showing all work periods
- Weekly view with visual histogram
- Color-coded indicators for weekends, holidays, and overtime

### Data Management
- Fix automatically generated timestamps
- View historical data by selecting different dates