# Technical Specification

## Project Structure

root/
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
├── submission.json

---

## Backend
- Express server
- PostgreSQL database
- JWT authentication
- bcrypt hashing
- Auto migration & seed

---

## Frontend
- React application
- Protected routes
- Axios API client
- JWT stored in localStorage

---

## Docker Setup

Start entire system:
docker-compose up -d

Stop system:
docker-compose down

---

## Environment Variables
All environment variables are committed in backend/.env to ensure evaluation reproducibility.
