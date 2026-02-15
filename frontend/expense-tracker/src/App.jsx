import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import SignUp from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";
import Home from "./pages/Dashboard/Home";
import Income from "./pages/Dashboard/Income";
import Expense from "./pages/Dashboard/Expense";
import Budget from "./pages/Dashboard/Budget";
import Analytics from "./pages/Dashboard/Analytics";
import UserProvider from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";
import BankConnection from "./pages/BankConnection";
import Subscriptions from "./pages/Subscriptions";

const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <div>
          <Router>
            <Routes>
              <Route path="/" element={<Root />} />
              <Route path="/login" exact element={<Login />} />
              <Route path="/signUp" exact element={<SignUp />} />
              <Route path="/dashboard" exact element={<Home />} />
              <Route path="/income" exact element={<Income />} />
              <Route path="/expense" exact element={<Expense />} />
              <Route path="/budget" exact element={<Budget />} />
              <Route path="/analytics" exact element={<Analytics />} />
              <Route path="/bank-connection" exact element={<BankConnection />} />
              <Route path="/subscriptions" exact element={<Subscriptions />} />
            </Routes>
          </Router>
          <Toaster
            toastOptions={{
              className: "",
              style: {
                fontSize: "13px",
              },
            }}
          />
        </div>
      </UserProvider>
    </ThemeProvider>
  );
};

export default App;

const Root = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated ? (
    <Navigate to="/dashboard" />
  ) : (
    <Navigate to="/login" />
  );
};
