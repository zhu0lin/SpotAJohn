# Spot-a-John

A full-stack application with React frontend and Express backend.

## Project Structure

```
spot-a-john/
├── frontend/          # React frontend
├── backend/           # Express backend
├── shared/            # Shared types, utilities
├── docker-compose.yml # Local development
├── package.json       # Root scripts
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional, for containerized development)

### Development Setup

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```
   This will start both frontend (port 3000) and backend (port 3001) concurrently.

### Individual Services

**Frontend only:**
```bash
npm run dev:frontend
```

**Backend only:**
```bash
npm run dev:backend
```

### Docker Development

Start all services with Docker:
```bash
docker-compose up
```

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend
- `npm run test` - Run tests for both frontend and backend
- `npm run lint` - Run linting for both frontend and backend
- `npm run install:all` - Install dependencies for all packages

## API Endpoints

- `GET /` - API welcome message
- `GET /health` - Health check endpoint

## Shared Utilities

The `shared/` directory contains utilities, types, and constants that can be used by both frontend and backend:

- `shared/types/` - Type definitions and validation schemas
- `shared/utils/` - Utility functions
- `shared/constants/` - Application constants

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request
