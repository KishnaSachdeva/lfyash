# EduPortaile - Lost & Found Campus Platform

A modern, full-stack Lost and Found platform built for Chitkara University campus. This application helps students report lost items, found items, and connect with each other through real-time chat to reunite belongings with their owners.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Folder Structure](#folder-structure)
5. [Installation & Setup](#installation--setup)
6. [Environment Variables](#environment-variables)
7. [API Endpoints](#api-endpoints)
8. [Syllabus Concept Mapping](#syllabus-concept-mapping)
9. [File-by-File Explanation](#file-by-file-explanation)
10. [Demo Credentials](#demo-credentials)

---

## 🎯 Project Overview

**EduPortaile** is a centralized platform where Chitkara University students can:
- Report lost items with details (category, location, date, image)
- Report found items to help others
- Browse active lost/found listings
- Claim found items through real-time chat
- Receive smart notifications when matching items are reported

The platform restricts signups to college emails (`@chitkara.edu.in`) and uses secure password hashing plus JWT-backed sessions.

---

## ✨ Features

### Authentication & Security
- **College Email Restriction**: Only `@chitkara.edu.in` emails allowed
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Stored in HTTP-only cookies for secure session management
- **Session Management**: Persistent sessions stored in PostgreSQL

### Lost & Found Items
- **Dual Reporting**: Single form for both lost and found items
- **Categories**: Electronics, Clothing, Books, Accessories, Other
- **Cloud Image Storage**: Integrated Cloudinary for secure and scalable image hosting
- **Status Tracking**: Active → Claimed → Resolved workflow
- **Smart Matching**: Algorithm matches lost items with found items based on:
  - Category match
  - Keyword overlap in description
  - Location similarity

### Real-Time Communication
- **Socket.io Chat**: Full-duplex communication between claimant and finder
- **Room-Based**: Each item has a dedicated chat room
- **Message Persistence**: All chats stored in PostgreSQL via Prisma ORM

### UI/UX
- **Modern Landing Page**: Black-blue gradient theme with smooth animations
- **Responsive Design**: Mobile-friendly with Google Fonts (Poppins)
- **Dashboard**: Sidebar navigation, notification badge, quick actions
- **SSR + CSR**: EJS for server-rendered pages, Socket.io for client-side chat

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Template Engine** | EJS (Server-Side Rendering) |
| **Authentication** | bcrypt, JSON Web Tokens (JWT) |
| **Session** | express-session, cookie-parser |
| **Real-Time** | Socket.io |
| **File Storage** | Cloudinary + Multer |
| **Testing** | Jest, Supertest |
| **Logging** | Morgan |
| **Frontend** | Vanilla JS, CSS3 |

---

## 📁 Folder Structure

```
lost-and-found-campus/
├── config/
│   ├── cloudinary.js       # Cloudinary API configuration
│   ├── db.js               # Database connection logic
│   ├── passport.js        # Passport.js configuration (optional)
│   └── env.js             # Environment variable loader
├── controllers/
│   ├── authController.js  # Register, login, logout logic
│   ├── itemController.js  # Lost/Found CRUD, claim, search
│   └── chatController.js  # Socket.io event handlers
├── services/
│   ├── prisma.js           # Prisma Client singleton
│   ├── userService.js      # User data access & business logic
│   ├── itemService.js      # Item CRUD & matching logic
│   ├── chatService.js       # Message persistence logic
│   └── notificationService.js # Notification management
├── middlewares/
│   ├── authMiddleware.js  # JWT verification middleware
│   ├── errorHandler.js    # Global error handler (handles Prisma errors)
│   ├── upload.js          # Multer + Cloudinary storage config
│   └── validate.js         # Zod request validation
├── prisma/
│   └── schema.prisma       # PostgreSQL schema definition
├── routes/
│   ├── authRoutes.js      # Authentication API routes
│   ├── itemRoutes.js      # Item CRUD API routes
│   └── viewRoutes.js      # SSR page routes (EJS)
├── public/
│   ├── css/
│   │   └── style.css      # Global styling
│   ├── js/
│   │   └── main.js        # Frontend scripts, Socket.io client
│   └── uploads/           # Local fallback for uploads
├── views/
│   ├── landing.ejs        # Landing page
│   ├── login.ejs          # Login page
│   ├── register.ejs       # Registration page
│   ├── dashboard.ejs      # User dashboard
│   ├── report.ejs         # Report item form
│   └── partials/          # Reusable components (header, footer)
├── tests/
│   ├── setup.js           # Test environment setup
 ...)
│   └── auth.test.js       # Unit tests for authentication
├── utils/
│   ├── matchAlgo.js       # Smart matching algorithm
├── app.js                 # Express app setup
├── server.js              # Server entry point, Socket.io init
├── package.json
├── .gitignore
└── .env
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (Installed and running)
- NPM or Yarn

### Step-by-Step Installation

1. **Navigate to the project directory:**
   ```bash
   cd lost-and-found-campus
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   copy .env.example .env
   ```

4. **Configure environment variables:**
   Edit `.env` file with your credentials:
   - Set `DATABASE_URL` to your PostgreSQL connection string:
     `postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME?schema=public`
   - Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - Set `JWT_SECRET` and `SESSION_SECRET` to random secure strings

5. **Initialize Database:**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Run migrations to create tables in PostgreSQL
   npm run prisma:migrate
   ```

6. **Start the application:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

7. **Access the application:**
   Open browser and navigate to `http://localhost:3000`

---

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `DATABASE_URL` | PostgreSQL connection string | (required) |
| `JWT_SECRET` | Secret key for JWT signing | (required) |
| `JWT_EXPIRE` | JWT token expiration | 7d |
| `SESSION_SECRET` | Secret for express-session | (required) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name | (required) |
| `CLOUDINARY_API_KEY` | Cloudinary API key | (required) |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | (required) |

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login with credentials | No |
| POST | `/logout` | Logout user | Yes |
| GET | `/me` | Get current user | Yes |

### Item Routes (`/api/items`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all items (filter by type) | No |
| GET | `/lost` | Get all lost items | No |
| GET | `/found` | Get all found items | No |
| GET | `/:id` | Get single item by ID | No |
| POST | `/` | Create new item | Yes |
| POST | `/:id/claim` | Claim a found item | Yes |
| PATCH | `/:id/resolve` | Mark item as resolved | Yes |
| DELETE | `/:id` | Delete item | Yes |
| GET | `/my/items` | Get current user's items | Yes |

### Notification Routes (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/unread-count` | Get unread notification count | Yes |
| GET | `/` | Get all notifications | Yes |
| PATCH | `/mark-read` | Mark notifications as read | Yes |

---

## 📚 Syllabus Concept Mapping

This table demonstrates how each syllabus concept is implemented in the project:

| **Syllabus Concept** | **Implementation Location** | **How It's Demonstrated** |
|---------------------|----------------------------|---------------------------|
| **Middleware Lifecycle** | | |
| Application-level | `app.js` | `app.use(morgan())`, `app.use(express.json())` |
| Router-level | `routes/authRoutes.js` | `router.post('/register', validate, register)` |
| Error-handling | `middlewares/errorHandler.js` | Catching Prisma `P2002` unique constraint errors |
| Third-party | `app.js` | `morgan`, `cookie-parser`, `express-session` |
| Body parsing | `app.js` | `express.json()` and `express.urlencoded()` |
| **Blocking vs Non-Blocking** | `services/*.js` | Async/await with Prisma operations |
| **Template Engines (SSR vs CSR)** | | |
| Server-Side Rendering | `views/*.ejs`, `routes/viewRoutes.js` | EJS templates rendered on server |
| Client-Side Rendering | `public/js/main.js`, Socket.io chat | Chat messages rendered dynamically via JS |
| **Database & ORM** | | |
| Connection | `services/prisma.js` | Singleton PrismaClient instance |
| Schema Design | `prisma/schema.prisma` | Defined types and relations for User, Item, Chat |
| CRUD Operations | `services/*.js` | `prisma.user.create()`, `prisma.item.findMany()` |
| **Session Management** | | |
| express-session | `app.js` | Session middleware with persistent storage |
| Cookies | `app.js` | HTTP-only cookies for JWT storage |
| **Authentication** | | |
| Password Hashing | `services/userService.js` | `bcrypt.hash()` and `bcrypt.compare()` |
| JWT | `controllers/authController.js` | `jwt.sign()` on login, `jwt.verify()` on protected routes |
| **Real-Time Communication** | | |
| Socket.io Setup | `server.js` | `socket.io` attached to HTTP server |
| Full-Duplex Chat | `controllers/chatController.js` | `socket.on('sendMessage')`, `io.to(room).emit('receiveMessage')` |
| Room Management | `server.js` | `socket.join(itemId)`, `socket.to(room).emit()` |
| **Testing** | | |
| Unit Testing | `tests/*.test.js` | Jest and Supertest for API endpoint verification |
| **Error Handling** | | |
| Global Handler | `middlewares/errorHandler.js` | Centralized error formatting and status codes |
| Try-Catch | All controllers | Comprehensive async error catching |
| **Static Files** | `app.js` | `express.static('public')` serving CSS and JS |
| **Routing** | | |
| Route Parameters | `routes/itemRoutes.js` | `/items/:id` captures ID from URL |
| Response Methods | Controllers | `res.json()`, `res.render()`, `res.status().send()` |
| **NPM & Environment** | | |
| package.json | Root | Custom scripts: `npm run prisma:generate`, `npm run prisma:migrate` |
| .gitignore | Root | Excludes node_modules, .env, prisma migrations |
| dotenv | `config/env.js` | `dotenv.config()` loads .env variables |

---

## 📄 File-by-File Explanation

### Configuration Files

#### `config/cloudinary.js`
Configuration for Cloudinary API. Sets up the storage engine for image uploads.

#### `config/env.js`
Loads environment variables using `dotenv.config()`. Validates required variables.

### Services (Business Logic Layer)

#### `services/userService.js`
Contains all User-related data operations: registration, password hashing, and session tracking.

#### `services/itemService.js`
Handles item CRUD, integrates the smart matching algorithm, and manages image deletions from Cloudinary.

#### `services/chatService.js`
Manages persistence of real-time chat messages in PostgreSQL.

#### `services/notificationService.js`
Handles creation and retrieval of user notifications.

### Controllers
Now streamlined to handle request/response logic, delegating data operations to the Service layer.

#### `controllers/authController.js`
Logic for user registration, login, and session management.

#### `controllers/itemController.js`
Logic for reporting lost/found items, claiming items, and searching listings.

#### `controllers/chatController.js`
Socket.io event handlers for real-time item-specific chat rooms.

### Middlewares

#### `middlewares/authMiddleware.js`
Protects routes by verifying JWT from cookies.

#### `middlewares/errorHandler.js`
Global error handler that now supports Prisma client error codes.

#### `middlewares/upload.js`
Configures Multer with Cloudinary storage for secure image uploads.

#### `middlewares/validate.js`
Uses Zod to validate request body schemas before they reach the controller.

### Prisma Schema

#### `prisma/schema.prisma`
The source of truth for the database. Defines models for User, Item, ChatMessage, Notification, and UserSession with explicit relations.

---

## 👤 Demo Credentials

For testing purposes, you can use these credentials:

```
Email: test@chitkara.edu.in
Password: Test123!
```

---

## 🎨 UI/UX Design Notes

### Color Palette
- **Primary Background**: `#0a0a0a` (near black)
- **Secondary Background**: `#1a2a6c` (deep blue)
- **Gradient**: Linear gradient from black to blue
- **Accent**: `#00d4ff` (cyan for buttons/highlights)
- **Text**: `#ffffff` (white) with `#b3b3b3` (gray for secondary)

---

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Verify PostgreSQL is running
# Update DATABASE_URL in .env
# Run migrations:
npm run prisma:migrate
```

### Image Upload Not Working
- Ensure `CLOUDINARY_CLOUD_NAME`, `API_KEY`, and `API_SECRET` are correct in `.env`.

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

---

## 📝 Viva Preparation Tips

### Key Points to Remember:
1. **Prisma ORM**: Explain how it provides type-safety and easy migrations compared to Mongoose.
2. **Service Layer**: Discuss why moving logic from controllers to services improves maintainability.
3. **Cloud Storage**: Explain the benefit of using Cloudinary over local storage for images.
4. **JWT & Sessions**: Clarify the hybrid approach for API and SSR.

---

## 📄 License

ISC

---

**Built with ❤️ for Chitkara University**
