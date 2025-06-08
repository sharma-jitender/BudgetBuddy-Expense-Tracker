import React from "react";
import { LuDownload } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";
import moment from "moment";

const IncomeList = ({ transaction, onDelete, onDownload }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Income Source</h5>

        <button className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Downlaod
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {transaction?.map((income) => (
          <TransactionInfoCard
            key={income._id}
            title={income.source}
            icon={income.icon}
            date={moment(income.date).format("Do MMM YYYY")}
            amount={income.amount}
            type="income"
            onDelete={() => onDelete(income._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default IncomeList;
