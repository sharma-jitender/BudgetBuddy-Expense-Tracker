import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

// Tooltip component
const CustomTooltip = ({ active, payload, isDarkMode = false }) => {
  if (active && payload && payload.length) {
    const isMonthly = payload[0].payload.income !== undefined;
    
    if (isMonthly) {
      return (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} shadow-md rounded-lg p-3 border`}>
          <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>
            {payload[0].payload.name}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    } else {
      return (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} shadow-md rounded-lg p-2 border`}>
          <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-200' : 'text-purple-800'} mb-1`}>
            {payload[0].payload.category}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Amount:{' '}
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              ${payload[0].payload.amount}
            </span>
          </p>
        </div>
      );
    }
  }
  return null;
};

const CustomBarChart = ({ data, isDarkMode = false }) => {
  
  const getBarColor = (index) => {
    return index % 2 === 0 ? '#875cf5' : '#cfbefb';
  };

  // Check if this is monthly data (has income and expense properties)
  const isMonthlyData = data && data.length > 0 && data[0].income !== undefined;

  if (isMonthlyData) {
    return (
      <div className="mt-6 p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDarkMode ? '#4b5563' : '#e0e0e0'}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: isDarkMode ? '#d1d5db' : '#555' }}
              stroke="none"
            />
            <YAxis
              tick={{ fontSize: 12, fill: isDarkMode ? '#d1d5db' : '#555' }}
              stroke="none"
              label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', fill: isDarkMode ? '#d1d5db' : '#555' }}
            />
            <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
            <Legend wrapperStyle={{ color: isDarkMode ? '#d1d5db' : '#555' }} />
            <Bar dataKey="income" fill="#10b981" radius={[10, 10, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Original chart for category data
  return (
    <div className="mt-6 p-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="none" stroke={isDarkMode ? '#4b5563' : '#e0e0e0'} />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: isDarkMode ? '#d1d5db' : '#555' }}
            stroke="none"
          />
          <YAxis
            tick={{ fontSize: 12, fill: isDarkMode ? '#d1d5db' : '#555' }}
            stroke="none"
          />

          <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />

          <Bar
            dataKey="amount"
            radius={[10, 10, 0, 0]}
            fill="FF8042"
            activeDot={{ r: 8 , fill: "yellow"}}
            activeStyle={{ fill:"green"}}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
