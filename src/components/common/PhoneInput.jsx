import React from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function PhoneInputField({
  value,
  onChange,
  country = "pk",
  label = "Phone Number",
  error,
  className,
  ...props
}) {
  return (
    <div className={cn("w-full space-y-1.5", className)}>
      
      {/* LABEL */}
      {label && (
        <label className="text-sm font-semibold text-foreground">
          {label}
        </label>
      )}

      {/* WRAPPER */}
      <div
        className={cn(
          "relative flex items-center",
          "transition-all duration-200",
          error ? "text-red-500" : ""
        )}
      >
        <div className="absolute left-3 text-xs font-bold text-slate-400 pointer-events-none uppercase">
          {country}
        </div>
        <Input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "pl-10 h-10 rounded-xl",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          placeholder="Enter phone number..."
          {...props}
        />
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-xs text-red-500">
          {error.message || error}
        </p>
      )}
    </div>
  );
}

PhoneInputField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  country: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  className: PropTypes.string,
};