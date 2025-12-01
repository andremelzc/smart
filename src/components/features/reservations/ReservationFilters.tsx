"use client";

import { Filter } from "lucide-react";

export interface FilterSegment<T = string> {
  key: T;
  label: string;
}

interface ReservationFiltersProps<T = string> {
  title: string;
  subtitle?: string;
  statusSegments: FilterSegment<T>[];
  selectedStatus: T;
  onStatusChange: (status: T) => void;
  timeSegments?: FilterSegment[];
  selectedTime?: string;
  onTimeChange?: (time: string) => void;
  helpText?: string;
}

export function ReservationFilters<T = string>({
  title,
  subtitle,
  statusSegments,
  selectedStatus,
  onStatusChange,
  timeSegments,
  selectedTime,
  onTimeChange,
  helpText,
}: ReservationFiltersProps<T>) {
  const hasTimeFilters = timeSegments && selectedTime && onTimeChange;

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-700">{title}</span>
          {subtitle && <span className="text-gray-500">- {subtitle}</span>}
        </div>

        {/* Filters container */}
        <div
          className={`flex flex-col gap-6 ${hasTimeFilters ? "md:flex-row md:divide-x md:divide-gray-100" : ""}`}
        >
          {/* Status filters */}
          <div className="flex-1 space-y-3">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Estado de reservas
            </p>
            <div className="flex flex-wrap gap-2">
              {statusSegments.map((segment) => {
                const isSelected = selectedStatus === segment.key;
                return (
                  <button
                    key={String(segment.key)}
                    onClick={() => onStatusChange(segment.key)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors min-w-[100px] text-center ${
                      isSelected
                        ? "bg-blue-light-100 text-blue-light-700 border-blue-light-300 border"
                        : "border border-transparent text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {segment.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time filters - only for host variant */}
          {hasTimeFilters && (
            <>
              <div className="border-t border-gray-100 md:h-20 md:border-t-0 md:border-l md:border-gray-100" />
              <div className="flex-1 space-y-3 md:pl-6">
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Relevancia temporal
                </p>
                <div className="flex flex-wrap gap-2">
                  {timeSegments!.map((segment) => {
                    const isActive = selectedTime === segment.key;
                    return (
                      <button
                        key={segment.key}
                        onClick={() => onTimeChange!(segment.key)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors min-w-[100px] text-center ${
                          isActive
                            ? "bg-blue-light-100 text-blue-light-700 border-blue-light-300 border"
                            : "border border-transparent text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {segment.label}
                      </button>
                    );
                  })}
                </div>
                {helpText && (
                  <p className="text-xs text-gray-500">{helpText}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
