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

## Setup

### 1. Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
API_BASE_URL=http://localhost:3001
```

**Important:** Replace `your-secret-key-here-change-in-production` with a strong, random secret key. You can generate one using:

```bash
openssl rand -base64 32
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

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

### Role-Based Features

#### User Role
- Access to `/dashboard` - Personal dashboard with shift calendar
- Access to `/dashboard/stats` - Personal statistics
- View profile information and contract percentage
- Pin/unpin shifts for bidding
- Basic navigation sidebar

#### Admin Role
- All user features plus:
- Access to `/admin` - Admin panel
- Admin navigation link in sidebar
- User management interface
- System statistics and controls

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

The frontend expects your backend to have the following endpoints:

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

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin panel
│   ├── auth/
│   │   └── signin/
│   │       └── page.tsx      # Sign-in page
│   ├── dashboard/
│   │   ├── page.tsx          # User dashboard with shift calendar
│   │   └── stats/
│   │       └── page.tsx      # User statistics
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts  # NextAuth configuration
│   ├── layout.tsx            # Root layout with AuthProvider
│   └── page.tsx              # Home page with redirects
├── components/
│   ├── dashboard/
│   │   ├── shift-calendar.tsx # Weekly shift calendar component
│   │   └── window-selector.tsx # Shift window selector
│   ├── layout/
│   │   └── sidebar-layout.tsx # Sidebar layout component
│   ├── providers/
│   │   └── auth-provider.tsx  # NextAuth SessionProvider wrapper
│   └── ui/                    # Shadcn UI components
├── middleware.ts              # Route protection middleware
└── types/
    └── next-auth.d.ts        # NextAuth type extensions
```

## Customization

### Adding New Protected Routes

To add new protected routes, update the `matcher` in `src/middleware.ts`:

```typescript
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/:path*",
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
- All API calls should be made to the backend at `http://localhost:3001`
- Session data is stored in JWT tokens and persists across page reloads
- The middleware handles all route protection and role-based redirects
- Shift data is fetched in real-time and updated when pins change
- The calendar component uses responsive design principles

## Troubleshooting

### Authentication Not Working

1. Check that your backend is running on `http://localhost:3001`
2. Verify the `.env.local` file exists and has correct values
3. Ensure your backend login endpoint returns the expected user object format

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
