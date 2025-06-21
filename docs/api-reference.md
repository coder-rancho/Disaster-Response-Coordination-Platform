# API Reference

## Disasters API

### Create Disaster
- **POST** `/api/disasters`
- Creates a new disaster record
- **Body**:
  ```json
  {
    "title": "string",
    "location_name": "string",
    "description": "string",
    "tags": "string[]"
  }
  ```
- **Response**: Created disaster object

### Get All Disasters
- **GET** `/api/disasters`
- Get all disasters with optional tag filtering
- **Query Parameters**:
  - `tag`: Filter disasters by tag (optional)
- **Response**: Array of disaster objects

### Get Single Disaster
- **GET** `/api/disasters/:id`
- Get details of a specific disaster
- **Response**: Disaster object

### Update Disaster
- **PUT** `/api/disasters/:id`
- Update a disaster's details
- **Body**: Same as create
- **Response**: Updated disaster object

### Delete Disaster
- **DELETE** `/api/disasters/:id`
- Delete a specific disaster
- **Response**: Success message

## Reports API

### Create Report
- **POST** `/api/disasters/:disaster_id/reports`
- Create a new report for a disaster
- **Body**:
  ```json
  {
    "content": "string",
    "image_url": "string",
    "user_id": "string"
  }
  ```
- **Response**: Created report object

### Get Disaster Reports
- **GET** `/api/disasters/:disaster_id/reports`
- Get all reports for a specific disaster
- **Response**: Array of report objects

### Get Single Report
- **GET** `/api/disasters/:disaster_id/reports/:id`
- Get details of a specific report
- **Response**: Report object

### Update Report
- **PUT** `/api/disasters/:disaster_id/reports/:id`
- Update a report's details
- **Response**: Updated report object

### Delete Report
- **DELETE** `/api/disasters/:disaster_id/reports/:id`
- Delete a specific report
- **Response**: Success message

### Verify Image
- **POST** `/api/disasters/:disaster_id/reports/verify-image`
- Verify an image using Google Gemini API
- **Body**:
  ```json
  {
    "image_url": "string"
  }
  ```
- **Response**: Verification result

## Resources API

### Create Resource
- **POST** `/api/disasters/:disaster_id/resources`
- Create a new resource for a disaster
- **Body**:
  ```json
  {
    "name": "string",
    "location_name": "string",
    "type": "string"
  }
  ```
- **Response**: Created resource object

### Get Disaster Resources
- **GET** `/api/disasters/:disaster_id/resources`
- Get all resources for a specific disaster
- **Response**: Array of resource objects

### Get Nearby Resources (Disaster-specific)
- **GET** `/api/disasters/:disaster_id/resources/nearby`
- Get resources near a specific location for a disaster
- **Query Parameters**:
  - `latitude`: Search center latitude (optional if location_name provided)
  - `longitude`: Search center longitude (optional if location_name provided)
  - `location_name`: Location to search around (optional if coordinates provided)
  - `distance`: Search radius in meters (default: 10000)
  - `type`: Resource type filter (optional)
  - `limit`: Maximum results (default: 50)
- **Response**: Resources with distances and metadata

### Get Nearby Resources (Global)
- **GET** `/api/resources/nearby`
- Get resources near a location regardless of disaster
- **Query Parameters**: Same as disaster-specific endpoint
- **Response**: Resources with distances and metadata

### Update Resource
- **PUT** `/api/disasters/:disaster_id/resources/:id`
- Update a resource's details
- **Response**: Updated resource object

### Delete Resource
- **DELETE** `/api/disasters/:disaster_id/resources/:id`
- Delete a specific resource
- **Response**: Success message
