# Schedule Bidding Backend

A Node.js + Express backend API with PostgreSQL and Prisma ORM for managing user accounts with role-based authentication.

## Features

- 🔐 JWT-based authentication
- 👥 User management with roles (USER, ADMIN)
- 📊 Contract percentage tracking
- 🛡️ Role-based access control
- 🗄️ PostgreSQL database with Prisma ORM
- 🔒 Password hashing with bcrypt
- 🚦 Rate limiting and security headers

## Prerequisites

- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Database setup**
   - Create a PostgreSQL database named `schedule_bidding`
   - Copy `.env.example` to `.env` and update the database URL:
   ```bash
   cp .env.example .env
   ```
   
3. **Configure environment variables**
   Edit `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/schedule_bidding"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   NODE_ENV="development"
   ```

4. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

5. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

6. **Seed the database (optional)**
   ```bash
   npm run prisma:seed
   ```

7. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## Database Schema

### Updated Schema
```prisma
enum Role {
  USER
  ADMIN
}

enum ShiftType {
  EARLY
  LATE
}

model User {
  id              String   @id @default(cuid())
  name            String
  email           String   @unique
  password        String
  contractPercent Int      @default(100)
  role            Role     @default(USER)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  pins            Pin[]
}

model ShiftWindow {
  id        String   @id @default(cuid())
  name      String
  startDate DateTime
  endDate   DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  shifts    Shift[]
}

model Shift {
  id            String     @id @default(cuid())
  date          DateTime
  type          ShiftType
  shiftWindowId String
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  shiftWindow   ShiftWindow @relation(fields: [shiftWindowId], references: [id], onDelete: Cascade)
  pins          Pin[]
}

model Pin {
  userId    String
  shiftId   String
  createdAt DateTime @default(now())
  user      User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  shift     Shift @relation(fields: [shiftId], references: [id], onDelete: Cascade)
  @@id([userId, shiftId])
}
```

## API Endpoints

### Authentication

#### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "contractPercent": 100,
    "role": "USER"
  },
  "token": "jwt_token_here"
}
```

#### GET `/api/auth/me`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### User Management (Admin Only)

All user management endpoints require admin authentication.

#### POST `/api/users`
Register a new user (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "contractPercent": 80,
  "role": "USER"
}
```

#### GET `/api/users`
List all users (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "message": "Users retrieved successfully",
  "users": [
    {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "contractPercent": 100,
      "role": "ADMIN",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### PATCH `/api/users/:id`
Update user role or contract percentage (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request:**
```json
{
  "contractPercent": 75,
  "role": "USER"
}
```

### Shift Management (Admin Only)

All shift window and shift creation endpoints require admin authentication.

#### POST `/api/shift-windows`
Create a new shift window (admin only).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request:**
```json
{
  "name": "August - September 2025",
  "startDate": "2025-08-01T00:00:00.000Z",
  "endDate": "2025-09-30T23:59:59.999Z"
}
```

#### GET `/api/shift-windows`
List all shift windows (admin only).

#### PATCH `/api/shift-windows/:id`
Update a shift window (admin only).

#### DELETE `/api/shift-windows/:id`
Delete a shift window (admin only).

#### POST `/api/shifts`
Create a single shift (admin only).

**Request:**
```json
{
  "date": "2025-08-15T08:00:00.000Z",
  "type": "EARLY",
  "shiftWindowId": "window_id_here"
}
```

#### POST `/api/shifts/bulk`
Create multiple shifts at once (admin only).

**Request:**
```json
{
  "shifts": [
    {
      "date": "2025-08-15T08:00:00.000Z",
      "type": "EARLY",
      "shiftWindowId": "window_id_here"
    },
    {
      "date": "2025-08-15T16:00:00.000Z",
      "type": "LATE",
      "shiftWindowId": "window_id_here"
    }
  ]
}
```

### Shift Operations (Authenticated Users)

#### GET `/api/shifts?windowId=xyz`
List all shifts in a specific window.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Shifts retrieved successfully",
  "shifts": [
    {
      "id": "shift_id",
      "date": "2025-08-15T08:00:00.000Z",
      "type": "EARLY",
      "shiftWindowId": "window_id",
      "shiftWindow": {
        "id": "window_id",
        "name": "August - September 2025",
        "startDate": "2025-08-01T00:00:00.000Z",
        "endDate": "2025-09-30T23:59:59.999Z"
      },
      "_count": {
        "pins": 3
      }
    }
  ],
  "count": 1
}
```

#### GET `/api/shift-stats`
Get all shifts with pin statistics (admin only).

### Pin Management (Authenticated Users)

#### POST `/api/pins`
Create a new pin (users can pin shifts they want).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request:**
```json
{
  "userId": "user_id_here",
  "shiftId": "shift_id_here"
}
```

**Response:**
```json
{
  "message": "Pin created successfully",
  "pin": {
    "userId": "user_id",
    "shiftId": "shift_id",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "shift": {
      "id": "shift_id",
      "date": "2025-08-15T08:00:00.000Z",
      "type": "EARLY",
      "shiftWindow": {
        "id": "window_id",
        "name": "August - September 2025"
      }
    }
  }
}
```

#### GET `/api/pins/:userId`
Get all pins for a specific user.

**Response:**
```json
{
  "message": "User pins retrieved successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "data": [
    {
      "window": {
        "id": "window_id",
        "name": "August - September 2025",
        "startDate": "2025-08-01T00:00:00.000Z",
        "endDate": "2025-09-30T23:59:59.999Z"
      },
      "pins": [
        {
          "shiftId": "shift_id",
          "date": "2025-08-15T08:00:00.000Z",
          "type": "EARLY",
          "createdAt": "2025-01-01T00:00:00.000Z"
        }
      ]
    }
  ],
  "totalPins": 1
}
```

## Business Rules

### Pin Constraints
1. **Unique Pins**: A user can only pin each shift once
2. **Window Validation**: Shifts must be within their shift window's date range
3. **Cascading Deletes**: Deleting a shift window removes all associated shifts and pins

### Shift Type Enum
- `EARLY` - Early shift (e.g., morning)
- `LATE` - Late shift (e.g., evening)

## Admin Seeding

The first registered user is automatically promoted to ADMIN role when running the seed script:

```bash
npm run prisma:seed
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:reset` - Reset database and apply migrations
- `npm run prisma:seed` - Seed database (promote first user to admin)
- `npm run db:setup` - Run migrations and seed

## Security Features

- JWT token authentication
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100 requests per 15 minutes per IP)
- Security headers with Helmet.js
- Input validation and sanitization
- Role-based access control

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error 