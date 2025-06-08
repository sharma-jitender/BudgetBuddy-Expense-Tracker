import React, { useState, useEffect } from "react";
import { prepareExpenseBarChartData } from "../../utils/helper";
import CustomBarChart from "../Charts/CustomBarChart";

const Last30DaysExpenses = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (Array.isArray(data)) {
      const result = prepareExpenseBarChartData(data);
      setChartData(result);
    } else {
      setChartData([]);
    }
  }, [data]);

  return (
    <div className="card col-span-1">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-semibold">Last 30 Days Expense</h5>
      </div>
      {chartData && chartData.length > 0 ? (
        <CustomBarChart data={chartData} />
      ) : (
        <div className="text-gray-400 text-center py-8">
          No expense data available
        </div>
      )}
    </div>
  );
};

export default Last30DaysExpenses;
