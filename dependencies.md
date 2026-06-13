# Cafe POS System - Project Dependencies Reference

This document outlines the dependencies required to run both the client-side (React UI) and server-side (Express.js API) applications of the Cafe POS System.

---

## 💻 Frontend Dependencies (`client/`)

These dependencies are used to bundle, style, and handle state management in the React application.

### Core Libraries
* **`react` & `react-dom`**: Core framework for building the component-based virtual DOM.
* **`react-router-dom`**: Manages URL routing and client-side page transitions (e.g., POS terminal, Dashboard, Kitchen panel).
* **`@tanstack/react-query`**: State management library for syncing, caching, and updating remote server data.
* **`axios`**: Promise-based HTTP client to make request calls to the backend API endpoint.

### Styling & UI
* **`tailwindcss`**: Utility-first CSS framework for building custom layouts and visual styling.
* **`postcss` & `autoprefixer`**: PostCSS plug-ins to process CSS and append vendor prefixes.
* **`lucide-react`**: Clean, modern SVG icon library for panels and sidebar navigation items.

### Real-Time Communication
* **`socket.io-client`**: WebSockets library to connect to the backend server and receive real-time updates (e.g., instant order alerts on the Kitchen Display System).

### Development Tooling
* **`vite`**: High-performance frontend build tool and hot-reload dev server.

#### Frontend Installation Command:
```bash
cd client
npm install
```

---

## ⚙️ Backend Dependencies (`server/`)

These dependencies form the foundation of the Node.js REST API server, database ORM, and WebSocket relay.

### Core Server & Routing
* **`express`**: Minimalist web framework to handle API endpoints, request routing, and middlewares.
* **`cors`**: Middleware to enable Cross-Origin Resource Sharing, allowing the client (port 3000) to communicate with the server (port 5000).
* **`dotenv`**: Loads environment configuration variables from the local `.env` file (e.g., `DATABASE_URL`, `JWT_SECRET`).

### Database & ORM
* **`prisma` & `@prisma/client`**: Object-Relational Mapper (ORM) used to model database tables, handle migrations, and execute clean type-safe MySQL database queries.

### Authentication & Security
* **`jsonwebtoken`**: Generates and verifies secure JSON Web Tokens (JWT) for user authorization.
* **`bcryptjs`**: Cryptographic library to securely hash and compare employee and admin passwords.

### Real-Time Services
* **`socket.io`**: Bidirectional real-time event server to broadcast POS events directly to kitchen monitors.

### Development Tooling
* **`nodemon`**: Utility that monitors file changes in the directory and automatically restarts the Node server.

#### Backend Installation Command:
```bash
cd server
npm install
```
