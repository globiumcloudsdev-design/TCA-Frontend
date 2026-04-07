import React, { useRef } from "react";
import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

export default function CnicInput({
  value = "",
  onChange,
  label = "CNIC Number",
  error,
  className,
}) {
  const digits = value.replace(/\D/g, "").slice(0, 13);

  const parts = [
    digits.slice(0, 5),
    digits.slice(5, 12),
    digits.slice(12, 13),
  ];

  const maxLengths = [5, 7, 1];
  const refs = [useRef(null), useRef(null), useRef(null)];

  const handleChange = (idx, e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > maxLengths[idx]) {
      val = val.slice(0, maxLengths[idx]);
    }

    const newParts = [...parts];
    newParts[idx] = val;

    // next
    if (val.length === maxLengths[idx] && idx < 2) {
      refs[idx + 1].current?.focus();
    }

    // back
    if (
      val.length === 0 &&
      idx > 0 &&
      e.nativeEvent.inputType === "deleteContentBackward"
    ) {
      refs[idx - 1].current?.focus();
    }

    onChange(newParts.join(""));
  };

  const inputStyle = cn(
    "h-10 w-16 text-sm text-center rounded-lg border",
    "bg-background shadow-sm",
    "transition-all duration-200",
    "outline-none",
    "focus:ring-2 focus:ring-primary/70 focus:border-primary",
    "hover:border-primary/60",
    error
      ? "border-red-500 focus:ring-red-400"
      : "border-input"
  );

  return (
    <div className={cn("w-full max-w-xs space-y-1.5", className)}>
      
      {/* LABEL */}
      {label && (
        <label className="text-sm font-semibold text-foreground">
          {label}
        </label>
      )}

      {/* INPUT WRAPPER */}
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-2 rounded-xl border bg-muted/30",
          "focus-within:ring-2 focus-within:ring-primary/30",
          error ? "border-red-500" : "border-border"
        )}
      >
        {/* PART 1 */}
        <input
          ref={refs[0]}
          value={parts[0]}
          maxLength={5}
          inputMode="numeric"
          onChange={(e) => handleChange(0, e)}
          className={inputStyle}
        />

        <span className="text-muted-foreground text-sm font-medium">-</span>

        {/* PART 2 */}
        <input
          ref={refs[1]}
          value={parts[1]}
          maxLength={7}
          inputMode="numeric"
          onChange={(e) => handleChange(1, e)}
          className={cn(inputStyle, "w-16")}
        />

        <span className="text-muted-foreground text-sm font-medium">-</span>

        {/* PART 3 */}
        <input
          ref={refs[2]}
          value={parts[2]}
          maxLength={1}
          inputMode="numeric"
          onChange={(e) => handleChange(2, e)}
          className={cn(inputStyle, "w-10")}
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

CnicInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  className: PropTypes.string,
};