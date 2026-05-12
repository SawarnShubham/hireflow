# HireFlow 🚀

HireFlow is a backend-focused hiring and interview workflow platform designed to manage candidates, interviews, and hiring stages in a clean, scalable way.

This project is built to demonstrate **real-world backend engineering**, not just CRUD APIs.

---

## ✨ Key Features

- Candidate lifecycle management (Applied → Interview → Offer → Hired)
- Interview scheduling & status tracking
- Role-based access control (Admin / Recruiter)
- Secure authentication using JWT
- Clean RESTful API design
- Scalable and modular backend architecture
- Production-ready folder structure

---

## 🧠 Why HireFlow?

Most projects stop at basic APIs.

HireFlow focuses on:
- Backend workflow design
- Separation of concerns
- Extensibility for real hiring systems
- Interview-oriented backend best practices

This makes it suitable for **SDE-1 / Backend / Platform** interviews.

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- REST APIs

---

## 📁 Project Structure

hireflow-backend/
│
├── src/
│ ├── controllers/ # Business logic
│ ├── routes/ # API routes
│ ├── models/ # Database schemas
│ ├── middlewares/ # Auth & error handling
│ ├── config/ # DB & app configuration
│ └── utils/ # Helper utilities
│
├── .env.example
├── package.json
├── server.js
└── README.md


---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/SawarnShubham/hireflow.git
cd hireflow/hireflow-backend

2️⃣ Install dependencies
npm install

3️⃣ Configure environment variables

Create a .env file:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

4️⃣ Start the server
npm run dev


Server will run at:

http://localhost:5000

🔐 Authentication

JWT-based authentication

Protected routes using middleware

Token validation on every secured request

📌 API Design Principles

RESTful conventions

Clear request/response contracts

Centralized error handling

Stateless backend services

🚧 Future Improvements

Interview feedback & scoring system

Email notifications

Audit logs for recruiter actions

Admin dashboard

Frontend integration

👤 Author

Shubham Kumar
Backend Developer | System Design Enthusiast

GitHub: https://github.com/SawarnShubham