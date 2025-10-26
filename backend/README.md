# VisionCare Backend

Backend API for VisionCare eye health platform.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express
- **API:** TRPC
- **Database:** PostgreSQL + Drizzle ORM
- **Language:** TypeScript
- **Authentication:** JWT + OAuth (Apple, Google)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Setup database:
```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Or push schema directly (for development)
npm run db:push
```

4. Start development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema to database (dev only)
- `npm run db:studio` - Open Drizzle Studio
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## API Endpoints

### TRPC Routes

All TRPC routes are available at `/trpc`

#### Auth Router (`auth.*`)

- `auth.register` - Register new user
- `auth.login` - Login user
- `auth.refresh` - Refresh access token
- `auth.logout` - Logout user
- `auth.verifyEmail` - Verify email address
- `auth.requestPasswordReset` - Request password reset
- `auth.resetPassword` - Reset password
- `auth.me` - Get current user

#### Profile Router (`profile.*`)

- `profile.get` - Get user profile
- `profile.update` - Update basic profile
- `profile.getEyeProfile` - Get eye profile
- `profile.updateEyeProfile` - Create/update eye profile
- `profile.deleteAccount` - Delete account

### REST Endpoints

- `GET /health` - Health check

## Authentication

The API uses JWT tokens for authentication:

1. **Access Token** - Short-lived (15 min), used for API requests
2. **Refresh Token** - Long-lived (7 days), used to get new access tokens

### Using Protected Endpoints

Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Refreshing Tokens

When the access token expires, use the `auth.refresh` mutation with the refresh token to get a new access token.

## Database Schema

### Users
- Basic user information
- Authentication data
- Email verification

### Eye Profiles
- Detailed eye health information
- Vision correction data
- Medical history

### Calibration Data
- Eye tracking calibration points
- Transformation matrices
- Accuracy metrics

### Eye Test Results
- Various test types (Snellen, contrast, color, etc.)
- Individual eye scores
- Raw test data

### Health Logs
- Daily health entries
- Fatigue scores
- Symptoms and notes

### Sessions
- Refresh token management
- User session tracking

## Environment Variables

See `.env.example` for all available environment variables.

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for access tokens
- `REFRESH_TOKEN_SECRET` - Secret for refresh tokens

## Error Handling

All TRPC errors follow the standard TRPC error format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

## Testing

Run tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Deployment

1. Build the project:
```bash
npm run build
```

2. Set production environment variables

3. Run migrations:
```bash
npm run db:migrate
```

4. Start the server:
```bash
npm start
```

## License

MIT
