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
- Access to `/dashboard` - Personal dashboard
- Access to `/dashboard/stats` - Personal statistics
- View profile information and contract percentage
- Basic navigation sidebar

#### Admin Role
- All user features plus:
- Access to `/admin` - Admin panel
- Admin navigation link in sidebar
- User management interface
- System statistics and controls

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
│   │   ├── page.tsx          # User dashboard
│   │   └── stats/
│   │       └── page.tsx      # User statistics
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts  # NextAuth configuration
│   ├── layout.tsx            # Root layout with AuthProvider
│   └── page.tsx              # Home page with redirects
├── components/
│   ├── layout/
│   │   └── sidebar-layout.tsx # Sidebar layout component
│   ├── providers/
│   │   └── auth-provider.tsx  # NextAuth SessionProvider wrapper
│   └── ui/                    # Shadcn UI components
├── middleware.ts              # Route protection middleware
└── types/
    └── next-auth.d.ts        # NextAuth type extensions
```

## API Integration

The frontend expects your backend to have the following endpoint:

### POST `/api/auth/login`

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

**Response on failure:**
```json
{
  "error": "Invalid credentials"
}
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

## Troubleshooting

### Authentication Not Working

1. Check that your backend is running on `http://localhost:3001`
2. Verify the `.env.local` file exists and has correct values
3. Ensure your backend login endpoint returns the expected user object format

### TypeScript Errors

The application extends NextAuth types for custom user properties. If you see TypeScript errors related to session or user types, check `types/next-auth.d.ts`.

### Redirects Not Working

Check the middleware configuration and ensure the `NEXTAUTH_URL` environment variable matches your frontend URL.
