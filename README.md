# LMS Backend - Modular Architecture

A Learning Management System backend built with TypeScript, Express, and MongoDB using a modular architecture.

## Architecture Benefits

### 1. **Modular Organization**

- Each feature is self-contained in its own module
- Easy to locate and maintain specific functionality
- Clear separation of concerns

### 2. **Scalable Structure**

- Easy to add new modules without affecting existing ones
- Each module can be developed independently
- Clear boundaries between different features

### 3. **Service Layer Pattern**

- Business logic is separated from controllers
- Controllers handle HTTP requests/responses
- Services handle business operations
- Models handle data persistence

### 4. **Shared Resources**

- Common utilities and configurations in shared folder
- Reusable middleware and types
- Consistent response handling

## Module Structure

Each module follows the same pattern:

- **models/**: Database schemas and interfaces
- **controllers/**: HTTP request handlers
- **services/**: Business logic and data operations
- **routes/**: Route definitions and middleware

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret
```

3. Run the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
npm start
```

## Technologies Used

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Development Guidelines

1. **Module Independence**: Each module should be self-contained
2. **Service Layer**: Business logic goes in services, not controllers
3. **Error Handling**: Use consistent error responses
4. **Validation**: Validate input data using shared utilities
5. **Type Safety**: Use TypeScript interfaces for all data structures
