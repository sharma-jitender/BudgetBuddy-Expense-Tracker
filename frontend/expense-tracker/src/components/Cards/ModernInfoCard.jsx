import React from 'react';

const ModernInfoCard = ({ icon, title, value, color, gradient }) => {
  return (
    <div className="group relative bg-white dark:bg-gray-900 p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Subtle gradient overlay */}
      {gradient && (
        <div className={`absolute inset-0 opacity-5 ${gradient} pointer-events-none`} />
      )}
      
      <div className="relative flex items-start gap-4">
        {/* Icon container with muted background */}
        <div className={`w-14 h-14 flex items-center justify-center text-2xl text-white rounded-2xl ${color} shadow-lg shadow-primary/10 flex-shrink-0`}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            {title}
          </h6>
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-50 block">
            ₹{value}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ModernInfoCard;

