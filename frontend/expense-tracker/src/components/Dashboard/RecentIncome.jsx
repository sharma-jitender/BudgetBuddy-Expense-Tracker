import moment from 'moment';
import React from 'react';
import { LuArrowBigRight } from 'react-icons/lu';
import TransactionInfoCard from '../Cards/TransactionInfoCard';

const IncomeTransactions = ({ transactions, onSeeMore }) => {
   return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg">Income</h5>

        <button className="card-btn flex items-center gap-1" onClick={onSeeMore}>
          See All <LuArrowBigRight className="text-base" />
        </button>  
      </div>

      <div className="mt-6">
        {transactions?.slice(0, 5)?.map((item) => (
          <TransactionInfoCard
            key={item._id}
            title={item.category || item.category}
            icon={item.icon}
            date={moment(item.date).format('Do MMM YYYY')}
            amount={item.amount}
            type="income" 
            hideDeleteBtn
          />
        ))}
      </div>
    </div>
  );
};

export default IncomeTransactions;