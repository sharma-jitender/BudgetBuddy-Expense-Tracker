import React from "react";
import createCustomTooltip from "../Charts/CustomTooltip";
import createCustomLegend from "../Charts/CustomLegend";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CustomPieChart = ({
  data,
  label,
  totalAmount,
  colors,
  showTextAnchor,
  isDarkMode = false,
}) => {
  const CustomTooltip = createCustomTooltip(isDarkMode);
  const CustomLegend = createCustomLegend(isDarkMode);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={130}
          innerRadius={100}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={CustomTooltip}/>
        <Legend content={CustomLegend}/>

        {showTextAnchor && (
          <>
            <text
              x="50%"
              y="50%"
              dy={-25}
              textAnchor="middle"
              fill={isDarkMode ? '#d1d5db' : '#666'}
              fontSize="14px"
            >
              {label}
            </text>
            <text
              x="50%"
              y="50%"
              dy={8}
              textAnchor="middle"
              fill={isDarkMode ? '#f3f4f6' : '#333'}
              fontSize="24px"
              fontWeight="semi-bold"
            >
              ₹ {totalAmount}
            </text>
          </>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;
