import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const CustomLineChart = ({ data, isDarkMode = false }) => {
  const CustomTooltip = ({ active, payload }) => {
   if (active && payload && payload.length) {
      return (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} shadow-md rounded-lg p-2 border`}>
          <p className={`text-xs font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'} mb-1`}>
            {payload[0].payload.category}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Amount:
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              ${payload[0].payload.amount}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };
  return (
    <div className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
        <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#875cf5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#875cf5" stopOpacity={0} />
            </linearGradient>
        </defs>

        <CartesianGrid stroke={isDarkMode ? '#4b5563' : '#e0e0e0'} strokeDasharray="3 3"/>
        <XAxis dataKey="month" tick={{fontSize: 12, fill: isDarkMode ? '#d1d5db' : '#555' }} stroke="none"/>
        <YAxis tick={{fontSize: 12, fill: isDarkMode ? '#d1d5db' : '#555' }} stroke="none"/>
        <Tooltip content={<CustomTooltip />}/>

        <Area type="monotone" dataKey="amount" stroke="#875cf5" fill="url(#incomeGradient)" strokeWidth={3} dot={{ r:3, fill: "#ab8df8" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;
