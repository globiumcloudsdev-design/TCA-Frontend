import React from "react";
import PropTypes from "prop-types";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { cn } from "@/lib/utils";

/**
 * PhoneInputField — Premium phone input using react-phone-input-2
 */
export default function PhoneInputField({
  value,
  onChange,
  country = "pk",
  label = "Phone Number",
  error,
  className,
  required = false,
  ...props
}) {
  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <label className="text-sm font-semibold text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="phone-input-container">
        <PhoneInput
          country={country}
          value={value}
          onChange={(val) => {
            // If Pakistan (92) and user types '0' at the start of the number (920...)
            // we strip the '0' to keep it as 923...
            let cleaned = val;
            if (val.startsWith('920')) {
              cleaned = '92' + val.substring(3);
            }
            onChange(cleaned);
          }}
          placeholder="03XX XXXXXXX"
          enableSearch={true}
          onlyCountries={['pk', 'in']} // Restrict to keep it clean, but default is PK
          masks={{ pk: '... .......' }}
          prefix="+"
          containerClass={cn(
            "flex h-10 w-full rounded-xl border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 ring-red-500"
          )}
          inputClass="!w-full !h-full !border-none !bg-transparent !text-sm !pl-[48px] !rounded-xl"
          buttonClass="!border-none !bg-transparent !rounded-l-xl !hover:bg-transparent !pl-2"
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium">
          {error.message || error}
        </p>
      )}

      <style jsx global>{`
        .phone-input-container .react-tel-input .form-control {
          font-family: inherit;
        }
        .phone-input-container .react-tel-input .flag-dropdown {
          background-color: transparent !important;
          border: none !important;
        }
        .phone-input-container .react-tel-input .selected-flag {
          background-color: transparent !important;
        }
      `}</style>
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
  required: PropTypes.bool,
};