import React from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/**
 * CnicInput — Professional single-field masked input for CNIC
 * Format: XXXXX-XXXXXXX-X (15 characters total)
 */
export default function CnicInput({
  value = "",
  onChange,
  label = "CNIC Number",
  error,
  className,
  placeholder = "XXXXX-XXXXXXX-X",
  required = false,
  ...props
}) {
  const formatCnic = (val) => {
    // Remove all non-digits
    const digits = val.replace(/\D/g, "").slice(0, 13);
    
    let formatted = "";
    if (digits.length > 0) {
      formatted += digits.slice(0, 5);
      if (digits.length > 5) {
        formatted += "-" + digits.slice(5, 12);
        if (digits.length > 12) {
          formatted += "-" + digits.slice(12, 13);
        }
      }
    }
    return formatted;
  };

  const handleChange = (e) => {
    const rawVal = e.target.value;
    const formatted = formatCnic(rawVal);
    // Send only digits or formatted? Usually backend wants digits, 
    // but user asked for "proper input" which usually implies sending formatted string 
    // or handling it consistently. I'll send the formatted string to match the UI.
    onChange(formatted);
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <label className="text-sm font-semibold text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={15}
        className={cn(
          "h-10 rounded-xl font-mono",
          error && "border-red-500 focus-visible:ring-red-500"
        )}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-500 font-medium">
          {error.message || error}
        </p>
      )}
    </div>
  );
}

CnicInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  className: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.boolean,
};