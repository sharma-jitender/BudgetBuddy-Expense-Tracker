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
      {label && <label className="text-sm text-slate-800">{label}</label>}
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          className="border p-2 pr-10 rounded w-full"
          value={value}
          onChange={onChange}
        />
        {isPassword && (
          <span
            className="absolute right-3 top-2.5 text-slate-500 cursor-pointer"
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
