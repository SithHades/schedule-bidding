# Schedule Bidding System - Frontend

This is a Next.js application with NextAuth.js for authentication, Shadcn UI for components, and role-based access control.

## Features

- ✅ Email/password authentication (no OAuth)
- ✅ Role-based access control (user/admin)
- ✅ Automatic role-based redirects after login
- ✅ Sidebar layout with profile info and navigation
- ✅ Auth state persistence across page reloads
- ✅ Protected routes with middleware
- ✅ Beautiful UI with Shadcn components
- ✅ Shift Calendar with weekly grid view
- ✅ Pin/Unpin shift functionality
- ✅ Shift window selection
- ✅ Real-time shift data and pin counts
- ✅ Comprehensive admin panel with user management
- ✅ Shift popularity analytics with inline editing
- ✅ Automated shift window creation
- ✅ Personal statistics dashboard with charts and analytics
- ✅ Centralized API helper for backend communication

## Setup

### 1. Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Important:** 
- Replace `your-secret-key-here-change-in-production` with a strong, random secret key. Generate one using: `openssl rand -base64 32`
- The `NEXT_PUBLIC_API_URL` is used by the centralized API helper to communicate with your backend

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Commands

**Important:** Run development commands from the project root directory:

```bash
# Start the backend server
cd backend && npm run dev

# In a separate terminal, start the frontend
cd frontend && npm run dev
```

The application will be available at `http://localhost:3000` and will communicate with the backend at `http://localhost:3001`.

## API Helper System

### Centralized API Communication

All API calls use a centralized helper located in `src/lib/api.ts`:

```typescript
// Basic API call
export async function api(path: string, options: RequestInit = {})

// Authenticated API call (includes Authorization header)
export async function apiWithAuth(path: string, userId: string, options: RequestInit = {})
```

### Benefits

- **Consistent error handling** across all API calls
- **Automatic Content-Type headers** for JSON requests
- **Centralized configuration** using environment variables
- **Authentication helper** that automatically includes Authorization headers
- **Credentials support** for cookie-based authentication

### Usage Examples

```typescript
import { api, apiWithAuth } from "@/lib/api"

// Public endpoint
const data = await api("/public-endpoint")

// Authenticated endpoint
const userData = await apiWithAuth("/user-data", userId)

// POST request with data
const result = await apiWithAuth("/create-item", userId, {
  method: "POST",
  body: JSON.stringify({ name: "Item Name" })
})
```

## Authentication Flow

### Login Process

1. Users visit `/auth/signin` to log in
2. Credentials are sent to your backend API at `http://localhost:3001/api/auth/login`
3. On successful authentication, users are redirected based on their role:
   - **Admin users** → `/admin`
   - **Regular users** → `/dashboard`

### Protected Routes

The middleware protects the following routes:
- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires admin role
- `/auth/*` - Redirects authenticated users to their dashboard
- `/stats` - Requires authentication

### Role-Based Features

#### User Role
- Access to `/dashboard` - Personal dashboard with shift calendar
- Access to `/stats` - Comprehensive personal statistics and analytics
- Access to `/dashboard/stats` - Personal statistics (legacy)
- View profile information and contract percentage
- Pin/unpin shifts for bidding
- Basic navigation sidebar

#### Admin Role
- All user features plus:
- Access to `/admin` - Comprehensive admin panel
- **User Management**: Edit roles and contract percentages
- **Shift Analytics**: Monitor shift popularity and edit weights
- **Window Creation**: Create new bidding windows with automatic shift generation
- Admin navigation link in sidebar
- System status monitoring

## Personal Statistics Features (`/stats`)

### Key Metrics Dashboard
- **Total Shifts Pinned** - Current number of active pins
- **Contract Percentage** - Your employment allocation
- **Simulated Quota** - Expected shifts (contract% × 8)
- **Average Weight** - Average weight of your pinned shifts

### Progress Tracking
- **Quota Progress Bar** - Visual progress toward your expected shifts
- **Completion Status** - Shows if quota is met with helpful messaging
- **Weight Comparison** - Compare your average weight vs team average
- **Performance Insights** - Suggestions based on your selection patterns

### Visual Analytics
- **Weekday Distribution Chart** - Bar chart showing pinned shifts by day (Mon-Fri)
- **Weekly Trend Analysis** - Track shifts pinned over time with trend indicators
- **Color-coded Performance** - Green/red indicators for above/below average performance

### Real-time Updates
- **Live Data** - Statistics update when shifts are pinned/unpinned
- **Refresh Button** - Manual refresh option for latest data
- **Loading States** - Smooth loading animations during data fetch
- **Error Handling** - Graceful error handling with retry options

## Admin Panel Features

### User Management
- **View all users** with name, email, role, and contract percentage
- **Inline role editing** - Promote/demote users between user and admin roles
- **Contract percentage editing** - Adjust user contract percentages with validation
- **Edit protection** - Prevents admins from editing their own account
- **Real-time updates** - Changes are saved immediately to the backend

### Shift Popularity Analytics
- **Sortable table** with shift statistics (date, type, pin count, weight)
- **Visual indicators** for shift popularity (color-coded pin counts)
- **Inline weight editing** - Adjust shift weights that affect bidding algorithms
- **Real-time data** - Updates automatically when shifts are pinned/unpinned
- **Smart sorting** - Click column headers to sort by any field

### Shift Window Creation
- **Date range selection** with validation (no past dates, logical end dates)
- **Automatic naming** - Suggests window names based on date range
- **Custom naming** - Override suggested names with custom titles
- **Bulk shift generation** - Automatically creates Early/Late shifts for Monday-Friday
- **Success feedback** - Shows confirmation with number of shifts created
- **Form validation** - Prevents invalid date ranges and provides helpful error messages

## Shift Calendar Features

### Weekly Calendar Grid
- **Monday–Friday view** with early/late shifts per day
- **Visual shift cards** showing date, time, and pin count
- **Highlighted pinned shifts** with blue border and badge
- **Responsive design** that works on all screen sizes

### Shift Bidding
- **Click to pin/unpin** shifts directly from the calendar
- **Real-time updates** of pin counts
- **User-specific highlighting** for pinned shifts
- **Summary display** showing total pinned shifts

### Window Selection
- **Dropdown selector** for different shift bidding windows
- **Status indicators** (active, upcoming, closed)
- **Date range display** for selected window
- **Real-time window data** from backend

### Quota Calculation
- **Automatic calculation** based on contract percentage
- **Visual display** of estimated shift quota
- **Contract percentage integration** from user profile

## API Integration

The frontend uses the centralized API helper to communicate with your backend at the configured `NEXT_PUBLIC_API_URL`. All requests include proper headers and error handling.

### Required Backend Endpoints

#### Authentication
- **POST** `/api/auth/login` - User authentication

#### User Statistics
- **GET** `/user-stats/{userId}` - Personal statistics and analytics

#### User Management (Admin Only)
- **GET** `/users` - List all users
- **PATCH** `/users/{id}` - Update user role/contract percentage

#### Shift Management
- **GET** `/shifts?windowId={windowId}` - Get shifts for window
- **POST** `/pins` - Pin a shift
- **DELETE** `/pins/{shiftId}` - Unpin a shift

#### Shift Analytics (Admin Only)
- **GET** `/shift-stats` - Get shift popularity statistics
- **PATCH** `/shifts/{id}/weight` - Update shift weight

#### Shift Windows
- **GET** `/shift-windows` - List shift windows
- **POST** `/shift-windows` - Create new window (Admin only)

For detailed request/response formats, see the API Integration section below.

## API Request/Response Formats

### Authentication
#### POST `/api/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response on success:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "contractPercentage": 80
}
```

### User Statistics
#### GET `/user-stats/{userId}`
**Headers:**
```
Authorization: Bearer {userId}
```

**Response:**
```json
{
  "totalPinnedShifts": 6,
  "contractPercentage": 80,
  "simulatedQuota": 6,
  "averageWeight": 1.2,
  "pinnedShiftsByWeekday": {
    "monday": 2,
    "tuesday": 1,
    "wednesday": 0,
    "thursday": 2,
    "friday": 1
  },
  "teamAverageWeight": 1.1,
  "weeklyBreakdown": [
    {
      "week": "Week 1",
      "pinnedShifts": 3
    },
    {
      "week": "Week 2", 
      "pinnedShifts": 3
    }
  ]
}
```

### User Management (Admin Only)
#### GET `/users`
**Headers:**
```
Authorization: Bearer {userId}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "contractPercentage": 80
  }
]
```

#### PATCH `/users/{id}`
**Headers:**
```
Authorization: Bearer {userId}
Content-Type: application/json
```

**Request:**
```json
{
  "role": "admin",
  "contractPercentage": 90
}
```

### Shift Management
#### GET `/shifts?windowId={windowId}`
**Headers:**
```
Authorization: Bearer {userId}
```

**Response:**
```json
[
  {
    "id": 1,
    "date": "2024-01-15",
    "type": "early",
    "startTime": "08:00",
    "endTime": "16:00",
    "pinCount": 5,
    "isPinnedByUser": true
  }
]
```

#### POST `/pins`
**Headers:**
```
Authorization: Bearer {userId}
Content-Type: application/json
```

**Request:**
```json
{
  "userId": 1,
  "shiftId": 123
}
```

#### DELETE `/pins/{shiftId}`
**Headers:**
```
Authorization: Bearer {userId}
```

### Shift Analytics (Admin Only)
#### GET `/shift-stats`
**Headers:**
```
Authorization: Bearer {userId}
```

**Response:**
```json
[
  {
    "id": 1,
    "date": "2024-01-15",
    "type": "early",
    "startTime": "08:00",
    "endTime": "16:00",
    "pinCount": 5,
    "weight": 1.0
  }
]
```

#### PATCH `/shifts/{id}/weight`
**Headers:**
```
Authorization: Bearer {userId}
Content-Type: application/json
```

**Request:**
```json
{
  "weight": 1.5
}
```

### Shift Windows
#### GET `/shift-windows`
**Headers:**
```
Authorization: Bearer {userId}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "January 2024 Bidding",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "status": "active"
  }
]
```

#### POST `/shift-windows` (Admin Only)
**Headers:**
```
Authorization: Bearer {userId}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "February 2024 Bidding",
  "startDate": "2024-02-01",
  "endDate": "2024-02-29"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "February 2024 Bidding",
  "startDate": "2024-02-01",
  "endDate": "2024-02-29",
  "status": "upcoming",
  "shiftsCreated": 40
}
```

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Comprehensive admin panel
│   ├── auth/
│   │   └── signin/
│   │       └── page.tsx      # Sign-in page
│   ├── dashboard/
│   │   ├── page.tsx          # User dashboard with shift calendar
│   │   └── stats/
│   │       └── page.tsx      # User statistics (legacy)
│   ├── stats/
│   │   └── page.tsx          # Enhanced personal statistics dashboard
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts  # NextAuth configuration
│   ├── layout.tsx            # Root layout with AuthProvider
│   └── page.tsx              # Home page with redirects
├── components/
│   ├── admin/
│   │   ├── user-management.tsx    # User management table
│   │   ├── shift-stats.tsx        # Shift analytics with sorting
│   │   └── shift-window-creator.tsx # Window creation form
│   ├── dashboard/
│   │   ├── shift-calendar.tsx # Weekly shift calendar component
│   │   └── window-selector.tsx # Shift window selector
│   ├── stats/
│   │   └── user-stats.tsx     # Personal statistics component
│   ├── layout/
│   │   └── sidebar-layout.tsx # Sidebar layout component
│   ├── providers/
│   │   └── auth-provider.tsx  # NextAuth SessionProvider wrapper
│   └── ui/                    # Shadcn UI components
├── lib/
│   └── api.ts                 # Centralized API helper functions
├── middleware.ts              # Route protection middleware
└── types/
    └── next-auth.d.ts        # NextAuth type extensions
```

## Development Workflow

### Starting the Application

1. **Start Backend** (from project root):
   ```bash
   cd backend && npm run dev
   ```

2. **Start Frontend** (from project root, in a new terminal):
   ```bash
   cd frontend && npm run dev
   ```

3. **Access Application**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`

### Making API Changes

When your backend API changes:

1. Update the API endpoints in your backend
2. The frontend will automatically use the new endpoints through the centralized API helper
3. No changes needed in individual components unless the request/response format changes

### Environment Configuration

- **Development**: Uses `NEXT_PUBLIC_API_URL=http://localhost:3001`
- **Production**: Set `NEXT_PUBLIC_API_URL` to your production backend URL
- **Testing**: Configure separate API URL for testing environment

## Customization

### Adding New Protected Routes

To add new protected routes, update the `matcher` in `src/middleware.ts`:

```typescript
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/stats/:path*",
    "/your-new-route/:path*"  // Add your new route here
  ]
}
```

### Adding Navigation Items

To add new navigation items to the sidebar, update the `navigation` array in `src/components/layout/sidebar-layout.tsx`:

```typescript
const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    show: true
  },
  {
    name: "Your New Page",
    href: "/your-new-page",
    icon: YourIcon,
    show: true // or condition based on role
  }
]
```

### Extending the API Helper

To add new API functionality, extend `src/lib/api.ts`:

```typescript
// Add a new specialized helper
export async function apiWithPagination(
  path: string, 
  userId: string, 
  page: number = 1, 
  limit: number = 10
) {
  return apiWithAuth(`${path}?page=${page}&limit=${limit}`, userId)
}
```

### Customizing Statistics Dashboard

#### Adding New Metrics
- Extend the `UserStatsData` interface in `user-stats.tsx`
- Add new API endpoints to fetch additional data
- Create new card components for displaying metrics

#### Customizing Charts
- Modify the weekday distribution chart by updating `pinnedShiftsData`
- Add new chart types by creating additional chart components
- Customize colors and styling in the chart rendering logic

#### Adding Comparisons
- Extend the weight comparison section with new metrics
- Add team-wide statistics by updating the API response
- Create new comparison visualizations

### Customizing Admin Components

#### User Management
- Modify user roles by updating the role options in `UserManagement` component
- Add new user fields by extending the `User` interface and updating the table
- Customize validation rules in the `saveUser` function

#### Shift Analytics
- Add new sortable columns by extending the `SortField` type
- Customize color coding in `getPinCountColor` function
- Add new filters or views by modifying the component state

#### Window Creator
- Modify shift generation logic by updating the backend endpoint
- Add new validation rules in the `validateForm` function
- Customize the auto-naming logic in `generateWindowName`

### Customizing Shift Calendar

The shift calendar can be customized by:
- Modifying the `getShiftForDayAndType` function for different date grouping
- Updating the `ShiftCard` component for different visual styles
- Adjusting the `estimatedQuota` calculation logic
- Adding new shift types beyond "early" and "late"

### Styling

The application uses Tailwind CSS with Shadcn UI components. You can customize the theme by modifying:
- `tailwind.config.ts` - Tailwind configuration
- `src/app/globals.css` - Global styles and CSS variables

## Development Notes

- The application uses Next.js 14 with App Router
- TypeScript is configured with strict type checking
- All API calls use the centralized helper in `src/lib/api.ts`
- Session data is stored in JWT tokens and persists across page reloads
- The middleware handles all route protection and role-based redirects
- Shift data is fetched in real-time and updated when pins change
- The calendar component uses responsive design principles
- Admin features are completely separated from user features for security
- Statistics are calculated in real-time and cached for performance

## Troubleshooting

### Authentication Not Working

1. Check that your backend is running on the configured API URL
2. Verify the `.env.local` file exists and has correct values
3. Ensure your backend login endpoint returns the expected user object format
4. Check the browser network tab for CORS issues

### API Helper Issues

1. Verify `NEXT_PUBLIC_API_URL` is set correctly in `.env.local`
2. Check that the backend is accessible at the configured URL
3. Ensure proper CORS configuration on your backend
4. Check browser console for API error messages

### Environment Variable Problems

1. Ensure `.env.local` file is in the `frontend` directory (not project root)
2. Restart the development server after changing environment variables
3. Verify variable names start with `NEXT_PUBLIC_` for client-side access
4. Check that variables are properly loaded using `console.log(process.env.NEXT_PUBLIC_API_URL)`

### Statistics Page Not Loading

1. Verify the `/user-stats/{userId}` endpoint is implemented in your backend
2. Check that the user statistics data format matches the expected interface
3. Ensure proper authorization headers are sent with stats requests
4. Verify the endpoint returns all required fields (totalPinnedShifts, contractPercentage, etc.)

### Charts Not Displaying

1. Check that `pinnedShiftsByWeekday` data is properly formatted in the API response
2. Verify weekday names match expected format (lowercase: monday, tuesday, etc.)
3. Ensure `weeklyBreakdown` array contains proper week/shift data
4. Check browser console for JavaScript errors in chart rendering

### Progress Bar Issues

1. Verify `simulatedQuota` calculation is correct (contractPercentage × 8)
2. Check that `totalPinnedShifts` accurately reflects current pins
3. Ensure progress calculation handles edge cases (quota = 0, pins > quota)

### Admin Panel Not Loading

1. Verify your user account has admin role in the database
2. Check that admin-specific endpoints are implemented in your backend
3. Ensure proper authorization headers are sent with admin requests
4. Check browser network tab for API response errors

### User Management Issues

1. Verify the `/users` GET endpoint returns proper user data
2. Check that the PATCH `/users/{id}` endpoint accepts role and contractPercentage updates
3. Ensure proper validation on the backend to prevent invalid role assignments

### Shift Analytics Problems

1. Check that the `/shift-stats` endpoint is available and returns proper data
2. Verify the PATCH `/shifts/{id}/weight` endpoint for weight updates
3. Ensure shift statistics include all required fields (id, date, type, pinCount, weight)

### Window Creation Failures

1. Verify the POST `/shift-windows` endpoint accepts the required fields
2. Check that the backend automatically creates shifts for the new window
3. Ensure proper date validation on both frontend and backend
4. Verify the response includes the number of shifts created

### Shift Calendar Not Loading

1. Verify your backend has the `/shifts` endpoint implemented
2. Check that the shift data format matches the expected interface
3. Ensure the Authorization header is correctly formatted
4. Check browser network tab for API response errors

### Pin/Unpin Not Working

1. Verify the `/pins` POST and DELETE endpoints are implemented
2. Check that the user ID is correctly passed in requests
3. Ensure proper authorization headers are sent
4. Verify the backend returns appropriate status codes

### Window Selector Issues

1. Check that the `/shift-windows` endpoint is available
2. Verify the window data format matches the expected interface
3. Ensure proper error handling for unavailable windows

### TypeScript Errors

The application extends NextAuth types for custom user properties. If you see TypeScript errors related to session or user types, check `types/next-auth.d.ts`.

### Redirects Not Working

Check the middleware configuration and ensure the `NEXTAUTH_URL` environment variable matches your frontend URL.
