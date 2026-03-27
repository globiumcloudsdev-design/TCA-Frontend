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

export default function TimePickerField({
  value,
  onChange,
  mode = "simple", // simple | google
  interval = 20,
  placeholder = "Select Time",
  className
}) {

  const [open, setOpen] = useState(false);

  const timeSlots = generateTimeSlots(interval);

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

        {value || placeholder}
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
              {time}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}