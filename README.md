# Fincra

FullStack Engineer Assessment

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Run Instructions](#run-instructions)
- [Approach & Trade-offs](#approach--trade-offs)
- [Live Demo](#live-demo)

---

## Project Overview

This project is a fullstack application built as part of the Fincra FullStack Engineer assessment. It consists of a backend API and a frontend client, designed to demonstrate best practices in modern web development.

---

## Tech Stack

- **Backend:** Node.js, Nestjs, (DB: SQLITE.)
- **Frontend:** React (Nextjs)
- **Other:** Docker, Jest (for testing), terraform (for IAC)

---

## Setup Instructions

### Backend

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   - Copy `.env.example` to `.env` and fill in the required values.

4. **Run database migrations (if applicable):**
   ```bash
   npm run migrate
   ```

### Frontend

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values.

### Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=sqlite:./dev.db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=2h

# API Configuration
API_KEY=your-api-key-here

# Others
EXCHANGE_RATE_API_KEY=your-api-key-here
EXCHANGE_BASE_URL=https://api.exchangerate.host
```

### Frontend (.env.local)

```env
# API Configuration
NEXT_PUBLIC_BACKEND_API=http://localhost:3000
NEXT_PUBLIC_BACKEND_API_KEY=your-api-key-here
```

**Note:** Replace the placeholder values with your actual configuration. Never commit sensitive values to version control.

---

## Run Instructions

### Backend

```bash
cd backend
npm run start:dev
```

The backend server will start on [http://localhost:3000](http://localhost:3000) (or your configured port).

### Frontend

```bash
cd frontend
npm start
```

The frontend will start on [http://localhost:3000](http://localhost:3000) (or your configured port).

---

## Approach & Trade-offs

### Approach

- **Separation of Concerns:** The project is split into distinct frontend and backend codebases for clarity and maintainability.
- **API-First:** The backend exposes a RESTful API consumed by the frontend.
- **Environment Variables:** Sensitive configuration is managed via environment variables.
- **Testing:** Basic unit and integration tests are included for critical components.

### Trade-offs

- **Simplicity vs. Scalability:** The architecture is kept simple for assessment purposes, but can be extended for production use.
- **Authentication:** Basic JWT token is implemented with API_KEY for security.
- **Error Handling:** Basic error handling is implemented; more robust solutions (e.g., centralized logging) can be added.

---

## Live Demo

- [Live Frontend](https://frontend-production-56bd.up.railway.app/)
- [Live Backend API](https://backend-production-fb8f.up.railway.app/)

---

## Crendential

email: abrahamosazee3@gmail.com
password: Omorisiagbon123

can also create new crendentials

---

## Docs

- [Backend postman doc](https://documenter.getpostman.com/view/30702099/2sB2xFeneu)

---

## License

This project is for assessment purposes only.
