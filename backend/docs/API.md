# StayNest API Documentation

## Overview

StayNest is a homestay booking platform API built with Node.js, Express, and MongoDB.

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes
- Support endpoints: 5 requests per 15 minutes

## Endpoints

### Authentication

#### Register User

```http
POST /api/users/register
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "guest" // or "host"
}
```

#### Login User

```http
POST /api/users/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Google OAuth

```http
GET /api/auth/google
```

### Properties

#### Get All Properties

```http
GET /api/properties
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `city` (optional): Filter by city
- `propertyType` (optional): Filter by property type
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

#### Get Property by ID

```http
GET /api/properties/:id
```

#### Create Property (Host only)

```http
POST /api/properties
```

**Request Body:**

```json
{
  "title": "Beautiful Apartment",
  "description": "A lovely place to stay...",
  "location": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA"
  },
  "price": 150,
  "propertyType": "apartment",
  "bedrooms": 2,
  "bathrooms": 2,
  "maxGuests": 4,
  "amenities": ["WiFi", "Kitchen", "Pool"]
}
```

### Bookings

#### Create Booking

```http
POST /api/bookings
```

**Request Body:**

```json
{
  "propertyId": "property_id_here",
  "checkIn": "2024-06-01",
  "checkOut": "2024-06-05",
  "guests": {
    "adults": 2,
    "children": 1,
    "infants": 0
  }
}
```

#### Get User Bookings

```http
GET /api/bookings
```

### Reviews

#### Create Review

```http
POST /api/reviews
```

**Request Body:**

```json
{
  "bookingId": "booking_id_here",
  "rating": 5,
  "comment": "Great place to stay!",
  "categories": {
    "cleanliness": 5,
    "communication": 5,
    "checkIn": 5,
    "accuracy": 5,
    "location": 5,
    "value": 5
  }
}
```

### Wishlist

#### Add to Wishlist

```http
POST /api/wishlist/wishlist
```

**Request Body:**

```json
{
  "propertyId": "property_id_here"
}
```

#### Get Wishlist

```http
GET /api/wishlist/wishlist
```

### File Upload

#### Upload Image

```http
POST /api/upload/image
```

**Request:** Multipart form data with `image` field

### Support

#### Submit Support Query

```http
POST /api/support/query
```

**Request Body:**

```json
{
  "subject": "Booking Issue",
  "message": "I need help with my booking...",
  "category": "booking"
}
```

## Error Codes

| Code | Description                                |
| ---- | ------------------------------------------ |
| 400  | Bad Request - Invalid input data           |
| 401  | Unauthorized - Invalid or missing token    |
| 403  | Forbidden - Insufficient permissions       |
| 404  | Not Found - Resource doesn't exist         |
| 409  | Conflict - Resource already exists         |
| 422  | Validation Error - Input validation failed |
| 429  | Too Many Requests - Rate limit exceeded    |
| 500  | Internal Server Error                      |

## Security Features

- Helmet.js for security headers
- Rate limiting
- Input validation and sanitization
- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- File upload restrictions

## Development

### Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
```

### Running the Server

```bash
npm run dev  # Development with nodemon
npm start    # Production
```
