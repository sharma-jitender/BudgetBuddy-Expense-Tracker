import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const Input = ({ value, onChange, placeholder, label, type }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-2 mb-4">
      {label && <label className="text-sm text-slate-800 dark:text-gray-200">{label}</label>}
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          className="border border-gray-300 dark:border-gray-600 p-2 pr-10 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={onChange}
        />
        {isPassword && (
          <span
            className="absolute right-3 top-2.5 text-slate-500 dark:text-gray-400 cursor-pointer hover:text-slate-700 dark:hover:text-gray-300"
            onClick={toggleShowPassword}
          >
            {showPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
          </span>
        )}
      </div>
    </div>
  );
};

export default Input;
