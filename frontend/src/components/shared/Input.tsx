import React, { ComponentProps, forwardRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

type InputProps = {
  label: string;
} & ComponentProps<"input">;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="text-left flex flex-col gap-1">
        <label className="font-medium text-sm md:text-base">
          {label} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            className="hover:border-gray-700 text-xs md:text-sm appearance-none border rounded-lg px-3 py-3 outline-none focus:bg-transparent w-full placeholder-gray-400 focus:border-dashed text-gray-700 focus:border-primary-dark pr-10"
            required
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
            >
              {showPassword ? (
                <FiEyeOff className="text-sm md:text-sm" />
              ) : (
                <FiEye className="text-sm md:text-sm" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
