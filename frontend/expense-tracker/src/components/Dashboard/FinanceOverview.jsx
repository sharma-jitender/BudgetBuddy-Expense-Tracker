import React, { useEffect, useState } from "react";
import CustomPieChart from "../Charts/CustomPieChart";
const COLORS = ["#8b5cf6", "#f43f5e", "#f97316"];
const FinanceOverview = ({ totalBalance, totalIncome, totalExpense }) =>{
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Detect dark mode
    useEffect(() => {
      const checkDarkMode = () => {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      };
      checkDarkMode();
      const observer = new MutationObserver(checkDarkMode);
      observer.observe(document.documentElement, { attributes: true });
      return () => observer.disconnect();
    }, []);

    const balanceData = [
        {name: "Total  Balance", amount: totalBalance},
        {name: "Total  Expense", amount: totalExpense},
        {name: "Total  Income", amount: totalIncome},
    ]
    return <div className="card">
        <div className="flex items-center justify-between">
            <h5 className="text-lg">Financial Overview</h5>
        </div>
        <CustomPieChart 
        data ={balanceData}
        label="Total Balance"
        totalAmount ={`₹${totalBalance}`}
        colors= {COLORS}
        showTextAnchor
        isDarkMode={isDarkMode}
        />
    </div>
}

export default FinanceOverview;