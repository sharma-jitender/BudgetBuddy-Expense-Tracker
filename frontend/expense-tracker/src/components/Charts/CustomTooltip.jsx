import React from "react";

const createCustomTooltip = (isDarkMode = false) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} shadow-md rounded-lg p-2 border`}>
          <p className={`text-xs font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'} mb-1`}>
            {payload[0].name}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Amount:{" "}
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              ${payload[0].value}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };
  return CustomTooltip;
};

export default createCustomTooltip;
