# Docker Setup for Attire Application

This document explains how to run the Attire application using Docker.

## Quick Start

### Production Build

```bash
# Build and run the application in production mode
docker-compose up -d --build

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
```

### Development Build

```bash
# Run the application in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# The application will be available at:
# - Frontend: http://localhost:5173 (with hot reload)
# - Backend API: http://localhost:3001 (with hot reload)
```

## Services

### Frontend

-   **Production**: Built with Vite and served with Nginx
-   **Development**: Runs Vite dev server with hot reload
-   **Port**: 3000 (production) / 5173 (development)

### Backend

-   **Technology**: Node.js + Express + TypeScript
-   **Database**: SQLite with better-sqlite3
-   **Port**: 3001
-   **Features**: API endpoints, file uploads, database management

## Persistent Data

The following data is persisted using Docker volumes:

-   **Database**: SQLite database files in `/app/data`
-   **Uploads**: User uploaded images in `/app/uploads`

These volumes ensure your data persists even when containers are recreated.

## Volume Management

### View volumes

```bash
docker volume ls
```

### Inspect volume

```bash
docker volume inspect attire_attire-data
docker volume inspect attire_attire-uploads
```

### Backup data (optional)

```bash
# Backup database
docker run --rm -v attire_attire-data:/data -v $(pwd):/backup alpine tar czf /backup/database-backup.tar.gz -C /data .

# Backup uploads
docker run --rm -v attire_attire-uploads:/uploads -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /uploads .
```

## Development Workflow

### Starting development environment

```bash
# Start services in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Or run in background
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

### Viewing logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f server
```

### Stopping services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete your data)
docker-compose down -v
```

## Troubleshooting

### Rebuild containers

```bash
# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Access container shell

```bash
# Access server container
docker-compose exec server sh

# Access frontend container
docker-compose exec frontend sh
```

### Check container status

```bash
docker-compose ps
```

### Remove everything and start fresh

```bash
# Stop containers and remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild everything
docker-compose up --build
```

## Environment Variables

### Frontend (.env file in frontend directory)

```env
VITE_API_URL=http://localhost:3001
```

### Server (Environment variables in docker-compose.yml)

-   `NODE_ENV`: production/development
-   `PORT`: Server port (default: 3001)

## File Structure

```
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development overrides
├── frontend/
│   ├── Dockerfile              # Frontend container definition
│   ├── nginx.conf              # Nginx configuration for production
│   └── .dockerignore           # Files to exclude from build context
└── server/
    ├── Dockerfile              # Backend container definition
    └── .dockerignore           # Files to exclude from build context
```

## Notes

-   The SQLite database and uploaded images are stored in named Docker volumes
    for persistence
-   In production, the frontend is served by Nginx for better performance
-   In development, both frontend and server support hot reload
-   The network configuration allows services to communicate with each other
-   CORS is configured to allow frontend-backend communication
