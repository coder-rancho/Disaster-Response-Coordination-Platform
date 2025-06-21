# Disaster Response Coordination Platform

A comprehensive platform for coordinating disaster response efforts, built with the MERN stack and featuring real-time updates, geospatial queries, and image verification.

## Demo

Frontend App: [Deployed on vercel](https://disaster-response-coordination-plat-weld.vercel.app/)  
Backend App: [Deployed on render](https://disaster-response-coordination-platform-9pmj.onrender.com/api/disasters)

## Documentation

Detailed documentation is available in the `docs` folder:

- [Features Documentation](docs/features.md) - Detailed feature descriptions and capabilities
- [API Reference](docs/api-reference.md) - Complete API endpoints and usage guide
- [Copilot Development Notes](docs/copilot-notes.md) - Detailed history of how GitHub Copilot assisted in development

## Features

- 🌍 **Disaster Management**: Create and track disasters with location, description, and tags
- 📍 **Resource Mapping**: Map and find nearby resources (shelters, supplies, etc.)
- 📱 **Real-time Reports**: Submit and verify reports with text and images
- 🔍 **Geospatial Search**: Find nearby resources using location or coordinates
- ⚡ **Real-time Updates**: Get immediate updates via WebSocket
- 🔒 **Audit Trail**: Track all changes to disaster records

## Technology Stack

- **Frontend**: React (Vite), TailwindCSS, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: PostgreSQL with PostGIS
- **APIs**: OpenStreetMap/Nominatim, Google Gemini API

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL with PostGIS extension
- Google Gemini API key (for image verification)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Disaster-Response-Coordination-Platform.git
   cd Disaster-Response-Coordination-Platform
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   ```

3. Set up the database:
   ```bash
   psql -U your_username -d your_database -f setup.sql
   ```

4. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env  # Configure your environment variables
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at http://localhost:5173

## Documentation

Detailed documentation is available in the `docs/` folder:

- [API Reference](docs/api-reference.md): Complete API endpoint documentation
- [Features Documentation](docs/features.md): Detailed feature explanations
- Database Schema: Available in `backend/setup.sql`

## Key Endpoints

### Disasters
- `POST /api/disasters`: Create a disaster
- `GET /api/disasters`: List all disasters
- `GET /api/disasters/:id`: Get a specific disaster

### Resources
- `POST /api/disasters/:id/resources`: Add a resource
- `GET /api/resources/nearby`: Find nearby resources
- `GET /api/disasters/:id/resources`: List disaster resources

### Reports
- `POST /api/disasters/:id/reports`: Submit a report
- `POST /api/disasters/:id/reports/verify-image`: Verify report image

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.