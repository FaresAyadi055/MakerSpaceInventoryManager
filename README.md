# FabLab Inventory Manager

A modern inventory management system for maker spaces, built with Nuxt 3, Vue 3, and PrimeVue.

## Overview

FabLab Inventory Manager is a full-stack application designed to help maker spaces efficiently manage their equipment and inventory. Users can browse available items, request equipment, track requests, and admins can manage inventory, handle requests, and monitor system logs.

## Features

- **User Authentication**: Secure login with JWT-based authentication
- **Inventory Management**: Browse and search equipment inventory
- **Request System**: Users can request items with tracking
- **Admin Dashboard**: Manage inventory, requests, and users
- **Logs & Monitoring**: Track system activities and changes
- **Missing Items Tracking**: Report and manage missing items
- **Purchase List**: Create and manage purchase orders
- **Real-time Notifications**: Toast notifications for actions

## Tech Stack

- **Frontend**: Vue 3, Nuxt 3, PrimeVue 4, Pinia
- **Styling**: Scoped CSS with PrimeIcons
- **HTTP Client**: Axios
- **Backend**: Node.js (Express), MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Package Manager**: pnpm

## Project Structure

```
├── app/
│   ├── components/        # Reusable Vue components
│   │   ├── Navbar.vue     # Navigation bar with cart & user menu
│   │   └── Footer.vue     # Application footer
│   └── pages/             # Nuxt auto-routed pages
│       ├── index.vue      # Root page (redirects to /home)
│       ├── login.vue      # Login page
│       ├── home.vue       # Home/inventory page
│       ├── cart.vue       # Request cart & management
│       ├── admin.vue      # Admin dashboard
│       ├── requests.vue   # Request tracking
│       ├── missing.vue    # Missing items management
│       ├── logs.vue       # System logs
│       └── purchase-list.vue # Purchase order management
├── stores/                # Pinia state management
│   └── auth.ts            # Authentication state & actions
├── utils/                 # Utility functions
│   └── api.ts             # Axios instance with interceptors
├── middleware/            # Route middleware
│   └── auth.ts            # Authentication guard
├── server/
│   ├── api/               # Nuxt server routes (for API endpoints)
│   ├── db/                # Database utilities
│   └── services/          # Business logic services
├── public/                # Static assets
├── nuxt.config.ts         # Nuxt configuration
└── package.json           # Dependencies
```

## Installation & Setup

### Prerequisites
- Node.js 20.19.0 or later
- pnpm (recommended) or npm

### Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### Environment Configuration

Create a `.env` file in the project root:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=inventory_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## API Integration

The application communicates with a backend API. The API base URL is configured via the `VITE_API_URL` environment variable and defaults to `http://localhost:3000/api`.

### Authentication Flow

1. User enters email on login page
2. Backend sends OTP/code via email
3. User verifies code
4. Backend returns JWT token and user data
5. Token is stored in localStorage for subsequent requests
6. Token is automatically included in all API requests via Axios interceptor

## State Management

Authentication state is managed using Pinia. The `useAuthStore` provides:
- User authentication status
- User profile information
- Login/logout functionality
- Admin role verification

```typescript
const authStore = useAuthStore()
authStore.isAuthenticated // Check if user is logged in
authStore.isAdmin         // Check if user is admin
authStore.logout()        // Logout user
```

## Components

### Navbar
- Displays application branding
- Shows user profile with avatar
- Admin-only navigation links
- Shopping cart with notification badge
- Logout functionality

### Footer
- Copyright information
- Contact links

## Route Protection

Routes are protected using Nuxt route middleware. Routes marked with `requiresAuth: true` will redirect unauthenticated users to the login page.

## Customization

You can now customize:
- Component styling and layout
- Page functionality and features
- API endpoints and requests
- Authentication flow
- Database schema and services

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run generate  # Generate static pages (if SSG is enabled)
```

## Notes

- The application is configured for Client-Side Rendering (CSR) by default
- API routes can be implemented in the `server/api/` directory
- Database services are located in `server/services/`
- Authentication middleware is applied to protected routes automatically

## Further Reading

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vue 3 Guide](https://vuejs.org/guide/introduction.html)
- [PrimeVue Documentation](https://primevue.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)

## License

ISC
