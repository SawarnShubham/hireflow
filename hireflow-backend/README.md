# HireFlow Backend

HireFlow is a local-first Node.js backend for a hiring workflow platform. It provides authentication, job management, and application tracking for recruiters and candidates.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Swagger API documentation

## Features

- User registration and login
- Recruiter-only job creation, update, and soft delete
- Public job listing and single job details
- Candidate job applications with PDF resume upload
- Recruiter-side application review and status updates
- Interactive API docs at `/api-docs`

## Project Structure

```text
hireflow-backend/
|-- src/
|   |-- config/
|   |-- controllers/
|   |-- middlewares/
|   |-- models/
|   |-- routes/
|   |-- swagger/
|   |-- utils/
|   |-- app.js
|   `-- server.js
|-- uploads/
|-- .env
|-- .env.example
|-- package.json
`-- README.md
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start MongoDB locally

The backend is configured for a local MongoDB instance:

```env
MONGO_URI=mongodb://127.0.0.1:27017/hireflow
```

Make sure MongoDB is running before starting the backend.

### 3. Configure environment variables

Copy `.env.example` to `.env` and update the secrets:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/hireflow
ACCESS_TOKEN_SECRET=replace_with_a_secure_secret
REFRESH_TOKEN_SECRET=replace_with_a_secure_secret
```

### 4. Run the backend

Development mode:

```bash
npm run dev
```

Normal mode:

```bash
npm start
```

## URLs

- API base URL: `http://localhost:3000`
- Swagger docs: `http://localhost:3000/api-docs`

## Available Scripts

- `npm run dev` runs the backend with `nodemon`
- `npm start` runs the backend with Node
- `npm test` prints a placeholder message until real tests are added

## Environment Variables

- `PORT`: Express server port
- `MONGO_URI`: MongoDB connection string
- `ACCESS_TOKEN_SECRET`: secret for signing access tokens
- `REFRESH_TOKEN_SECRET`: reserved for refresh-token support

## Notes

- This setup is for local development only.
- Docker is not required.
- Uploaded resumes are stored in `uploads/resumes`.

## Author

Shubham Kumar
