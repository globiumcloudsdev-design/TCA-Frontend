//src/components/common/TimePickerField.jsx
'use client';

import { useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

function generateTimeSlots(interval = 20) {
  const slots = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += interval) {
      const h = String(hour).padStart(2, "0");
      const m = String(min).padStart(2, "0");
      slots.push(`${h}:${m}`);
    }
  }

  return slots;
}

function formatTo12H(time24) {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  let h = parseInt(hours, 10);
  const m = minutes;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12; // the hour '0' should be '12'
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}

export default function TimePickerField({
  value,
  onChange,
  mode = "simple", // simple | google
  interval = 20,
  placeholder = "Select Time",
  min,
  max,
  className
}) {

  const [open, setOpen] = useState(false);
  
  const allTimeSlots = generateTimeSlots(interval);
  const timeSlots = allTimeSlots.filter(slot => {
    if (min && slot < min) return false;
    if (max && slot > max) return false;
    return true;
  });

  // SIMPLE MODE (native browser)
  if (mode === "simple") {
    return (
      <div className="relative">
        <Clock
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <input
          type="time"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
            className
          )}
        />
      </div>
    );
  }

  // GOOGLE CALENDAR STYLE
  return (
    <div className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full cursor-pointer items-center rounded-md border border-input bg-background pl-9 pr-3 text-sm"
      >
        <Clock
          size={16}
          className="absolute left-3 text-muted-foreground"
        />

        {value ? formatTo12H(value) : placeholder}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 h-56 w-full overflow-y-auto rounded-md border bg-white shadow-md">
          {timeSlots.map((time) => (
            <div
              key={time}
              onClick={() => {
                onChange(time);
                setOpen(false);
              }}
              className={cn(
                "cursor-pointer px-3 py-2 text-sm hover:bg-gray-100",
                value === time && "bg-primary/10 font-medium"
              )}
            >
              {formatTo12H(time)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}