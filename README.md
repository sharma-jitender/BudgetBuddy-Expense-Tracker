Budget Buddy

Budget Buddy is a simple and intuitive expense tracker web application that helps users manage their finances by tracking their income and expenses. Whether you're a student, working professional, or managing a household, Budget Buddy empowers you to stay on top of your spending habits.

Features
Add and manage income & expense entries
Visual insights with charts (if implemented)
Date-wise filtering of transactions
Easy-to-use UI for quick tracking
User authentication and secure access (if applicable)

Tech Stack
Frontend: React.js, Tailwind CSS
Backend: Node.js, Express.js
Database: MongoDB
Others: Axios, Mongoose, Moment.js

Installation & Setup
Prerequisites
Node.js and npm installed
MongoDB installed or access to MongoDB Atlas
Git
Steps
Clone the repository
git clone git@github.com:your-username/budget-buddy.git cd budget-buddy Install dependencies

bash

For both frontend and backend
cd client npm install

cd ../server npm install Configure environment variables

Create a .env file in the /server folder and add:

ini MONGODB_URI=your_mongodb_connection_string JWT_SECRET=your_jwt_secret Start the server

bash cd server npm start Start the client

bash cd ../client npm start  Authentication (Optional) If your app includes authentication, users will be able to:

Register and login securely

Track personal transactions privately

 Project Structure bash Copy code budget-buddy/ │ ├── frontend/ # React frontend ├── backend/ # Express backend ├── README.md └── .gitignore  Author Your Name – @yourhandle

 License This project is licensed under the MIT License.

🙌Contributions Pull requests and suggestions are welcome! If you'd like to improve Budget Buddy, feel free to fork the repo and submit a PR.

Live Link https://budgetbuddy-frontend-5zwl.onrender.com/login
