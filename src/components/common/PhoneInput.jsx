import React from "react";
import PropTypes from "prop-types";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { cn } from "@/lib/utils";

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
          "rounded-xl border bg-muted/30 px-2 py-1.5",
          "transition-all duration-200",
          "focus-within:ring-2 focus-within:ring-primary/30",
          error ? "border-red-500" : "border-border"
        )}
      >
        <PhoneInput
          country={country}
          value={value}
          onChange={onChange}
          enableSearch
          disableSearchIcon={false}
          
          containerClass="!w-full !bg-transparent"
          
          inputClass={cn(
            "!w-full !h-10 !pl-12 !pr-3",
            "!bg-transparent !border-0",
            "!text-sm !shadow-none",
            "!outline-none !ring-0",
            "!focus:ring-0",
          )}

          buttonClass={cn(
            "!border-0 !bg-transparent",
            "!rounded-lg !mr-1",
            "hover:!bg-muted/50"
          )}

          dropdownClass="!z-50 !rounded-lg !border !shadow-md"
          
          searchClass="!p-2 !outline-none"

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