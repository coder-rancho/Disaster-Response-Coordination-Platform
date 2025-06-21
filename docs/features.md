# Features Documentation

## Disaster Management

The platform provides comprehensive disaster management capabilities:

### Disaster Creation and Tracking
- Create disasters with location, description, and tags
- Automatic location geocoding using OpenStreetMap/Nominatim
- Real-time updates via WebSocket
- Audit trail for tracking changes

### Resource Management
- Create and manage resources (shelters, supplies, etc.)
- Automatic geocoding of resource locations
- Associate resources with specific disasters
- Real-time resource updates

### Report Management
- Submit reports with text and images
- Image verification using Google Gemini API
- Real-time report updates
- Track report verification status

## Geospatial Features

### Location Services
- Automatic geocoding of location names to coordinates
- Support for direct coordinate input
- Efficient geospatial queries using PostGIS

### Nearby Resource Search
- Search resources near a location
- Support for both location names and coordinates
- Adjustable search radius (1km to 50km)
- Filter by resource type
- Distance-based sorting
- Current location support using browser geolocation

## Real-time Updates

The platform uses WebSocket connections for real-time updates:

### WebSocket Events
- `disaster_updated`: When disasters are created/updated/deleted
- `resource_updated`: When resources are created/updated/deleted
- `report_updated`: When reports are created/updated/deleted

### Event Data Format
```json
{
  "action": "create|update|delete",
  "data": {
    // Updated entity data
  }
}
```

## Database Structure

### Tables
- `disasters`: Main disaster records
- `resources`: Resource locations and details
- `reports`: User-submitted reports
- `cache`: API response caching

### Geospatial Features
- PostGIS extension for spatial queries
- Spatial indexes for efficient queries
- Built-in distance calculations

## Frontend Features

### Disaster Management
- Create and list disasters
- Filter disasters by tags
- View disaster details and location

### Resource Management
- Add resources to disasters
- View disaster-specific resources
- Search nearby resources
- Use current location

### Report Management
- Submit reports with images
- View report verification status
- Real-time report updates

## API Integration

### External Services
- OpenStreetMap/Nominatim for geocoding
- Google Gemini API for image verification
- Socket.IO for real-time updates

### Caching
- API response caching
- Configurable TTL (1 hour default)
- Automatic cache invalidation
