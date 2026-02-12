import React, { useState } from "react";
import { LuPlus, LuX } from "react-icons/lu";
import QuickAddSheet from "./QuickAddSheet";

const QuickAddFAB = ({ onAddExpense, onAddIncome, type = "expense" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        aria-label="Quick Add"
      >
        <LuPlus className="text-2xl group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Slide-over Sheet */}
      <QuickAddSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAddExpense={onAddExpense}
        onAddIncome={onAddIncome}
        type={type}
      />
    </>
  );
};

export default QuickAddFAB;

