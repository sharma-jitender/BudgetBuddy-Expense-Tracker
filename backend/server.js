require('dotenv').config();
const express =  require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const prisma = require("./config/prismaClient");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const budgetLimitRoutes = require("./routes/budgetLimitRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods:["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connectDB();

prisma.$connect()
  .then(() => console.log("Neon (Postgres) connected successfully"))
  .catch((err) => {
    console.error("Error connecting to Neon:", err.message);
    process.exit(1);
  });
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/budget-limit", budgetLimitRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
