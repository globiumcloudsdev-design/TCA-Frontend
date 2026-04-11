"use client";

import { useState } from "react";
import { format, parseISO, setMonth, setYear } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function MonthPicker({ value, onChange, placeholder = "Select Month" }) {
  // value expected in "yyyy-MM" format
  const currentDate = value ? parseISO(`${value}-01`) : new Date();
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [open, setOpen] = useState(false);
  
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const handleMonthSelect = (monthIndex) => {
    const newDate = setMonth(setYear(new Date(), viewYear), monthIndex);
    onChange(format(newDate, "yyyy-MM"));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={`h-8 min-w-[140px] justify-start text-xs font-bold shadow-sm border-slate-200 transition-all ${open ? 'ring-2 ring-blue-100 border-blue-300 bg-blue-50/50' : 'hover:bg-slate-50'}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
          {value ? format(currentDate, "MMMM yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 shadow-xl border-slate-200 rounded-xl" align="end">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-50">
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg text-slate-500" 
            onClick={() => setViewYear(v => v - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-extrabold text-slate-800 tracking-tight">{viewYear}</div>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg text-slate-500" 
            onClick={() => setViewYear(v => v + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {months.map((month, idx) => {
            const isSelected = value === format(setMonth(setYear(new Date(), viewYear), idx), "yyyy-MM");
            return (
              <Button
                key={month}
                variant="ghost"
                onClick={() => handleMonthSelect(idx)}
                className={`h-9 text-xs font-bold transition-all rounded-lg 
                  ${isSelected 
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:text-white' 
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
              >
                {month}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
