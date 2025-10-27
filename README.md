# Nest Service Starter

A modular NestJS service starter with authentication, user management, and enterprise-ready features.

## 🏗️ Architecture

This project follows a **modular architecture** with clean separation of concerns:

```
src/
├── common/                     # 🔧 Technical Infrastructure
│   ├── config/                 # Configuration (Database, Swagger)
│   ├── decorators/             # Reusable decorators
│   ├── guards/                 # Technical guards
│   ├── interceptors/           # HTTP interceptors
│   ├── pipes/                  # Validation & transformation
│   ├── filters/                # Exception filters
│   ├── utils/                  # Utility functions
│   └── constants/              # Technical constants
│
├── modules/                    # 📦 Business Modules
│   ├── auth/                   # 🗝️ Authentication
│   │   ├── dto/                # Data Transfer Objects
│   │   ├── entities/           # Database entities
│   │   ├── services/           # Business logic
│   │   ├── controllers/        # HTTP controllers
│   │   ├── strategies/         # Auth strategies
│   │   └── auth.module.ts      # Module definition
│   └── users/                  # 👥 User Management
│       ├── dto/                # Data Transfer Objects
│       ├── entities/           # Database entities
│       ├── services/           # Business logic
│       ├── controllers/        # HTTP controllers
│       └── users.module.ts     # Module definition
│
├── app.module.ts               # 🚀 Root Module
└── main.ts                     # 🎯 Application Entry Point
```

## 🚀 Features

- ✅ **Modular Architecture** - Clean and scalable module structure
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **User Management** - Complete CRUD with pagination and filtering
- ✅ **TypeORM Integration** - PostgreSQL database with migrations
- ✅ **Swagger Documentation** - Auto-generated interactive API docs
- ✅ **Input Validation** - Comprehensive DTO validation
- ✅ **Structured Logging** - Pino logger with context
- ✅ **Environment Config** - Type-safe configuration with Zod
- ✅ **Error Handling** - Centralized exception filters
- ✅ **Testing** - Unit and integration tests with Jest

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 13+
- pnpm (recommended)

## 🛠️ Installation

```bash
# Clone repository
git clone <repository-url>
cd nest-service-starter

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

## ⚙️ Environment Variables

```bash
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=nest_service_starter

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## 🏃‍♂️ Running the Application

```bash
# Development mode with hot reload
pnpm run start:dev

# Debug mode
pnpm run start:debug

# Production build
pnpm run build
pnpm run start:prod
```

## 📚 API Documentation

When running in development mode, Swagger documentation is available at:

```
http://localhost:3000/api/docs
```

## 🗂️ Available Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

### Users (`/users`)
- `GET /users` - Get all users (with pagination)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Soft delete user
- `PATCH /users/:id/activate` - Activate user
- `PATCH /users/:id/deactivate` - Deactivate user

## 🧪 Testing

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:cov

# Run e2e tests
pnpm run test:e2e
```

## 🔧 Development Commands

```bash
# Code formatting
pnpm run format

# Linting and auto-fix
pnpm run lint

# Build project
pnpm run build
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
