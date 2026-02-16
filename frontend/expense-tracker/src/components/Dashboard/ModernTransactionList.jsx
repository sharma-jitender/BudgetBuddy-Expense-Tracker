import React from "react";
import moment from "moment";
import { LuArrowBigRight } from "react-icons/lu";
import addThousandsSeprator from "../../utils/helper";

const ModernTransactionList = ({ transactions, title, onSeeMore, maxItems = 5 }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card">
        <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">{title}</h5>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          No transactions yet
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{title}</h5>
        {onSeeMore && (
          <button
            onClick={onSeeMore}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            See All <LuArrowBigRight className="text-base" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {transactions.slice(0, maxItems).map((item) => {
          const isIncome = item.type === "income" || Number(item.amount) > 0;
          const amount = addThousandsSeprator(item.amount);

          return (
            <div
              key={item._id}
              className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer"
            >
              {/* Icon with muted background */}
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                {item.icon ? (
                  <img
                    src={item.icon}
                    alt={item.type === "expense" ? item.category : item.source}
                    className="w-6 h-6"
                  />
                ) : (
                  <span className="text-xl">💰</span>
                )}
              </div>

              {/* Transaction details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                  {isIncome ? item.source : item.category}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {moment(item.date).format("MMM D, YYYY")}
                </p>
              </div>

              {/* Amount */}
              <div
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  isIncome
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                }`}
              >
                {isIncome ? "+" : "-"}₹{amount}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModernTransactionList;

