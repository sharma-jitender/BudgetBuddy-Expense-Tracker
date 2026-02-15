# Expense Tracker

An expense tracking web application that helps users manage their finances by recording income and expenses, tracking spending patterns, and managing budgets.

## Features

- Add and manage income and expense entries
- Visual analytics with charts and reports
- Transaction history with date filtering
- Budget management and spending alerts
- User authentication and secure access
- Bank account integration (optional)
- Subscription detection and tracking
- Excel export functionality

## Tech Stack

**Frontend:**
- React.js with Vite
- Tailwind CSS for styling
- Axios for API requests
- React Router for navigation
- React Hot Toast for notifications

**Backend:**
- Node.js with Express.js
- MongoDB for database
- Mongoose for ODM
- JWT for authentication
- Multer for file uploads

## Project Structure

```
ExpenseTracker/
├── frontend/expense-tracker/    # React frontend application
├── backend/                      # Express backend server
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB

### Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd ExpenseTracker
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend/expense-tracker
npm install
```

4. Configure environment variables:

Create `.env` file in the backend directory:
```
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
CLIENT_URL=http://localhost:5173
```

5. Start the backend server:
```bash
cd backend
npm start
```

6. Start the frontend application:
```bash
cd frontend/expense-tracker
npm run dev
```

## Usage

1. Register a new account or log in
2. Add income and expense entries
3. View analytics on the dashboard
4. Set monthly budgets and track spending
5. Export transaction history as Excel files

## License

This project is licensed under the MIT License.

🙌Contributions Pull requests and suggestions are welcome! If you'd like to improve Budget Buddy, feel free to fork the repo and submit a PR.

Live Link https://budgetbuddy-frontend-5zwl.onrender.com/login
