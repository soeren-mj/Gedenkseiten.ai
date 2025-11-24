'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, addMonths, subMonths, getYear, getMonth, setYear } from 'date-fns';

interface InlineDatePickerProps {
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  defaultYear?: number; // Default year to display (e.g., 1964 for birth)
  onClose?: () => void;
}

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const DAY_LABELS = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];

/**
 * InlineDatePicker Component
 *
 * Calendar picker with year selector (Apple-style)
 * - Click month/year header to open year picker
 * - Navigate months with arrow buttons
 * - Today's date highlighted with accent color
 * - Selected date has rounded background
 */
export function InlineDatePicker({ value, onChange, defaultYear = new Date().getFullYear(), onClose }: InlineDatePickerProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'year-picker'>('calendar');
  const [displayDate, setDisplayDate] = useState<Date>(() => {
    if (value) {
      return new Date(value);
    }
    // Use current month when opening (for death date)
    const now = new Date();
    return new Date(defaultYear, now.getMonth(), 1);
  });

  const today = new Date();
  const selectedDate = value ? new Date(value) : null;
  const yearPickerRef = useRef<HTMLDivElement>(null);

  // Scroll to selected year when year picker opens
  useEffect(() => {
    if (viewMode === 'year-picker' && yearPickerRef.current) {
      const selectedYearElement = yearPickerRef.current.querySelector('[data-selected="true"]');
      if (selectedYearElement) {
        selectedYearElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [viewMode]);

  // Generate calendar days
  const monthStart = startOfMonth(displayDate);
  const monthEnd = endOfMonth(displayDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate offset for first day of month (0 = Sunday)
  const firstDayOffset = monthStart.getDay();

  // Navigate months
  const handlePreviousMonth = () => {
    setDisplayDate(subMonths(displayDate, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(addMonths(displayDate, 1));
  };

  // Select date
  const handleSelectDate = (date: Date) => {
    const isoDate = format(date, 'yyyy-MM-dd');
    onChange(isoDate);
    onClose?.();
  };

  // Toggle year picker
  const handleToggleYearPicker = () => {
    setViewMode(viewMode === 'calendar' ? 'year-picker' : 'calendar');
  };

  // Select year
  const handleSelectYear = (year: number) => {
    setDisplayDate(setYear(displayDate, year));
    setViewMode('calendar');
  };

  // Generate year range (1900-2100)
  const years = Array.from({ length: 201 }, (_, i) => 1900 + i);
  const currentYear = getYear(displayDate);
  const currentMonth = getMonth(displayDate);

  return (
    <div className="bg-bw w-full">
      {viewMode === 'calendar' ? (
        <>
          {/* Header with Month/Year and Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePreviousMonth}
              className="p-1 hover:bg-tertiary rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-primary" />
            </button>

            <button
              type="button"
              onClick={handleToggleYearPicker}
              className="flex items-center gap-1 px-3 py-1 hover:bg-tertiary rounded transition-colors"
            >
              <span className="text-body-m text-primary font-medium">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <ChevronDown className="w-4 h-4 text-primary" />
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-tertiary rounded transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_LABELS.map((day) => (
              <div key={day} className="text-center text-xs text-secondary font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 justify-items-center">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Date cells */}
            {calendarDays.map((date) => {
              const isToday = isSameDay(date, today);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isFuture = isAfter(date, today);
              const dateNum = format(date, 'd');

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => !isFuture && handleSelectDate(date)}
                  disabled={isFuture}
                  className={`
                    w-9 h-9 flex items-center justify-center text-body-s rounded-full
                    transition-colors
                    ${isSelected
                      ? 'rounded-full bg-interactive-primary-default text-bw font-medium'
                      : isToday
                        ? 'text-accent font-medium'
                        : isFuture
                          ? 'text-interactive-disabled cursor-not-allowed'
                          : 'text-primary hover:bg-tertiary rounded'
                    }
                    disabled:hover:bg-transparent
                  `}
                >
                  {dateNum}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Year Picker View */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handleToggleYearPicker}
              className="flex items-center gap-1 px-3 py-1 hover:bg-tertiary rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-primary" />
              <span className="text-body-m text-primary font-medium">Jahr wählen</span>
            </button>
          </div>

          <div
            ref={yearPickerRef}
            className="max-h-[300px] overflow-y-auto space-y-1 pr-2 w-full"
          >
            {years.map((year) => {
              const isCurrentYear = year === currentYear;
              return (
                <button
                  key={year}
                  type="button"
                  data-selected={isCurrentYear}
                  onClick={() => handleSelectYear(year)}
                  className={`
                    w-full text-center py-2 rounded transition-colors text-body-m
                    ${isCurrentYear
                      ? 'bg-interactive-primary-default text-white font-medium'
                      : 'text-primary hover:bg-tertiary'
                    }
                  `}
                >
                  {year}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
