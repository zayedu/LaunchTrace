# LaunchTrace - SpaceX Parts Management System

A full-stack application for tracking rocket parts and builds, designed as a SpaceX interview preparation project.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Angular 17    │    │   .NET 8 Web API │    │   PostgreSQL    │
│   Frontend      │◄──►│   (Minimal API)  │◄──►│   Database      │
│   (Port 4200)   │    │   (Port 5029)    │    │   (Port 5432)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
   Angular Material         Entity Framework          Docker
   Standalone Components    Core + Npgsql             Container
```

## Tech Stack

- **Backend**: .NET 8 Web API with Minimal APIs
- **Database**: PostgreSQL with Entity Framework Core
- **Frontend**: Angular 17 Standalone Components with Angular Material
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

## Domain Models

- **Supplier**: Company providing parts
- **Part**: Individual components with status (OK/FAULTY)
- **Build**: Rocket assembly with serial number and date
- **BuildPart**: Many-to-many relationship between builds and parts

## Quick Start

### Prerequisites

- .NET 8 SDK
- Node.js 18+
- Docker & Docker Compose
- Angular CLI (`npm install -g @angular/cli`)

### Option 1: Docker Compose (Recommended)

```bash
# Clone and navigate to project
git clone <repository-url>
cd LaunchTrace

# Start services (database + API)
docker-compose up -d

# The API will be available at http://localhost:5029
# Database will be seeded automatically with sample data
```

### Option 2: Local Development

```bash
# 1. Start PostgreSQL
docker run --name postgres-launchtrace -e POSTGRES_DB=launchtrace -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16

# 2. Restore .NET packages and run API
dotnet restore
dotnet run --project LaunchTrace/LaunchTrace.csproj

# 3. In another terminal, start Angular frontend
cd launchtrace-ui
npm install
ng serve

# Access the application at http://localhost:4200
```

### Database Setup

If running locally, create the database and run migrations:

```bash
# Create and apply migrations
dotnet ef migrations add InitialCreate --project LaunchTrace
dotnet ef database update --project LaunchTrace

# Seed the database
docker exec -i postgres-launchtrace psql -U postgres -d launchtrace < seed_data_int.sql
```

## API Endpoints

| Method | Endpoint                        | Description                      |
| ------ | ------------------------------- | -------------------------------- |
| GET    | `/api/parts?skip={}&take={}`    | Get paginated parts list         |
| POST   | `/api/parts/{id}/flagFaulty`    | Mark part as faulty              |
| GET    | `/api/impacted-builds/{partId}` | Get builds using a specific part |

## Frontend Features

- **Parts Table**: Paginated table with filtering (All/OK/FAULTY)
- **Flag Faulty**: Button to mark parts as defective
- **Builds Dialog**: Placeholder for viewing impacted builds
- **Loading States**: Spinner during API calls
- **Responsive Design**: Material Design components

## Testing

```bash
# Run integration tests
dotnet test

# The tests use WebApplicationFactory to verify:
# 1. GET /api/parts returns data
# 2. POST /api/parts/{id}/flagFaulty toggles status
```

## Database Schema

```sql
-- Sample data includes:
-- 30 suppliers
-- 1,500 parts (90% OK, 10% FAULTY)
-- 200 builds with random dates (last 365 days)
-- Each build has 2-10 random parts with quantities 1-4
```

## Development Commands

```bash
# Backend
dotnet build                          # Build solution
dotnet run --project LaunchTrace     # Run API
dotnet test                          # Run tests

# Frontend
ng serve                             # Dev server
ng build                             # Production build
npm run test                         # Unit tests

# Docker
docker-compose up -d                 # Start all services
docker-compose down                  # Stop all services
docker-compose logs api              # View API logs
```

## File Structure

```
LaunchTrace/
├── LaunchTrace/                     # .NET Web API
│   ├── Models/                      # Domain models & DTOs
│   ├── Data/                        # DbContext
│   └── Program.cs                   # API endpoints
├── LaunchTrace.Tests/               # Integration tests
├── launchtrace-ui/                  # Angular frontend
│   ├── src/app/components/          # UI components
│   ├── src/app/services/            # HTTP services
│   └── src/app/models/              # TypeScript interfaces
├── docker-compose.yml               # Multi-container setup
├── Dockerfile                       # API container
├── seed_data_int.sql               # Database seed script
└── .github/workflows/ci.yml        # CI pipeline
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Run `dotnet test` and `ng test`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
