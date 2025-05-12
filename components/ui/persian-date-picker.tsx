"use client";

import { useState, forwardRef, useEffect } from "react";
import { 
  format, 
  getDay, 
  getDaysInMonth, 
  addMonths, 
  setMonth,
  addYears, 
  setYear,
  getMonth, 
  getYear, 
  startOfMonth,
  setDate
} from "date-fns-jalali";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type PersianDatePickerProps = {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

type CalendarView = "days" | "months" | "years";

export const PersianDatePicker = forwardRef<HTMLDivElement, PersianDatePickerProps>(
  ({ value, onChange, placeholder = "تاریخ را انتخاب کنید", className, disabled = false }, ref) => {
    const [date, setSelectedDate] = useState<Date | undefined>(value);
    const [open, setOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState<Date>(value || new Date());
    const [view, setView] = useState<CalendarView>("days");
    const [yearRangeStart, setYearRangeStart] = useState(() => {
      const currentYear = getYear(value || new Date());
      return currentYear - 4; // Center the current year in a range of 9 years
    });
    
    // Persian month names
    const persianMonths = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
    
    // Persian weekday names (short) - starting with Saturday
    const persianWeekdays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
    
    useEffect(() => {
      if (value && (!date || date.getTime() !== value.getTime())) {
        setSelectedDate(value);
        setCurrentMonth(value);
        setYearRangeStart(getYear(value) - 4);
      }
    }, [value, date]);

    const handleDateClick = (day: number) => {
      // Use setDate from date-fns-jalali to set the correct date
      const selectedDate = setDate(currentMonth, day);
      
      setSelectedDate(selectedDate);
      onChange?.(selectedDate);
      setOpen(false);
    };
    
    const handleMonthClick = (monthIndex: number) => {
      setCurrentMonth(setMonth(currentMonth, monthIndex));
      setView("days");
    };
    
    const handleYearClick = (year: number) => {
      setCurrentMonth(setYear(currentMonth, year));
      setView("months");
    };
    
    const goToPreviousYearSet = () => {
      setYearRangeStart(yearRangeStart - 9);
    };
    
    const goToNextYearSet = () => {
      setYearRangeStart(yearRangeStart + 9);
    };

    const renderCalendarHeader = () => {
      const currentYearStr = format(currentMonth, "yyyy");
      
      return (
        <div className="flex justify-center items-center mb-2">
          <div className="text-center font-medium">
            <Button 
              variant="ghost" 
              onClick={() => setView("months")} 
              className="px-2 py-1"
            >
              {persianMonths[getMonth(currentMonth)]}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setView("years")} 
              className="px-2 py-1"
            >
              {currentYearStr}
            </Button>
          </div>
        </div>
      );
    };

    const renderDaysView = () => {
      // Get number of days in current jalali month
      const daysInMonth = getDaysInMonth(currentMonth);
      const monthStart = startOfMonth(currentMonth);
      
      // In Persian calendar, the week starts with Saturday (6)
      // Convert day of week from 0-6 (Sun-Sat) to Persian calendar's 0-6 (Sat-Fri)
      let firstDayOfMonth = getDay(monthStart);
      // Convert Sunday (0) to 1, Monday (1) to 2, ..., Saturday (6) to 0
      firstDayOfMonth = (firstDayOfMonth + 1) % 7;
      
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
      
      const isToday = (day: number) => {
        const today = new Date();
        const todayJalali = new Date(today);
        
        const jalaliDay = Number(format(todayJalali, "d"));
        const jalaliMonth = getMonth(todayJalali);
        const jalaliYear = getYear(todayJalali);
        
        return (
          day === jalaliDay &&
          getMonth(currentMonth) === jalaliMonth &&
          getYear(currentMonth) === jalaliYear
        );
      };
      
      const isSelected = (day: number) => {
        if (!date) return false;
        return (
          day === Number(format(date, "d")) &&
          getMonth(currentMonth) === getMonth(date) &&
          getYear(currentMonth) === getYear(date)
        );
      };

      return (
        <>
          <div className="grid grid-cols-7 gap-1 mt-2">
            {persianWeekdays.map((day, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground">
                {day}
              </div>
            ))}

            {blanks.map((blank, i) => (
              <div key={`blank-${i}`} className="text-center p-1"></div>
            ))}

            {days.map((day) => (
              <Button
                key={day}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 p-0 font-normal text-sm",
                  isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  isToday(day) && !isSelected(day) && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleDateClick(day)}
              >
                {day}
              </Button>
            ))}
          </div>
        </>
      );
    };

    const renderMonthsView = () => {
      return (
        <div className="grid grid-cols-3 gap-2 mt-2 p-2">
          {persianMonths.map((month, i) => (
            <Button
              key={i}
              variant="ghost"
              className={cn(
                "py-2 h-auto",
                getMonth(currentMonth) === i && "bg-accent text-accent-foreground"
              )}
              onClick={() => handleMonthClick(i)}
            >
              {month}
            </Button>
          ))}
        </div>
      );
    };

    const renderYearsView = () => {
      const currentYear = getYear(currentMonth);
      const years = Array.from({ length: 9 }, (_, i) => yearRangeStart + i);
      
      return (
        <>
          <div className="flex justify-between items-center px-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToPreviousYearSet}
              className="h-7 w-7"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="text-sm text-center">
              {yearRangeStart} - {yearRangeStart + 8}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToNextYearSet}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 p-2">
            {years.map((year) => (
              <Button
                key={year}
                variant="ghost"
                className={cn(
                  "py-2 h-auto",
                  currentYear === year && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleYearClick(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </>
      );
    };

    const renderCalendarContent = () => {
      switch (view) {
        case "months":
          return renderMonthsView();
        case "years":
          return renderYearsView();
        default:
          return renderDaysView();
      }
    };

    const renderCalendar = () => {
      return (
        <div className="custom-calendar p-3 w-64" dir="rtl">
          {renderCalendarHeader()}
          {renderCalendarContent()}
        </div>
      );
    };

    return (
      <div ref={ref} className={cn("relative", className)}>
        <Popover open={open} onOpenChange={(openState) => {
          setOpen(openState);
          if (!openState) {
            // Reset to days view when closing
            setView("days");
          }
        }}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              type="button"
              className={cn(
                "w-full h-10 pl-3 text-right font-normal flex justify-between items-center",
                !date && "text-muted-foreground",
                disabled && "cursor-not-allowed opacity-50"
              )}
              disabled={disabled}
              dir="rtl"
            >
              {date ? format(date, "yyyy/MM/dd") : <span>{placeholder}</span>}
              <CalendarIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {renderCalendar()}
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

PersianDatePicker.displayName = "PersianDatePicker"; 