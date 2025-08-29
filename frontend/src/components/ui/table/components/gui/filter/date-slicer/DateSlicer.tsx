import React, { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import styles from "./date-slicer.module.css";
import type { ObjectDateFilter } from "../../../../types";

interface DateSlicerProps {
  value?: ObjectDateFilter;
  onChange?: (value: ObjectDateFilter) => void;
  label?: string;
  mode?: "range" | "single";
  min?: string; // Formato YYYY-MM-DD
  max?: string;
}

const DateSlicer: React.FC<DateSlicerProps> = ({
  value,
  onChange,
  label = "Fecha",
  mode = "range",
  min,
  max,
}) => {
  const isSingle = mode === "single";

  // Estado interno para fechas
  const [startDate, setStartDate] = useState<string>(value?.start || "");
  const [endDate, setEndDate] = useState<string>(isSingle ? "" : value?.end || "");

  // Sincronizar estado interno cuando cambian las props value
  useEffect(() => {
    if (value) {
      if (value.start !== startDate) setStartDate(value.start);
      if (!isSingle && value.end !== endDate) setEndDate(value.end || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isSingle]);

  // Manejadores para cambios en inputs y notificar al padre
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartDate(val);

    if (onChange) {
      onChange(isSingle ? { start: val } : { start: val, end: endDate });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEndDate(val);

    if (onChange && !isSingle) {
      onChange({ start: startDate, end: val });
    }
  };

  return (
    <div className={styles.dateSlicer}>
      <label className={styles.label}>
        <CalendarDays size={18} /> {label}
      </label>

      <div className={styles.inputs}>
        <input
          type="date"
          value={startDate}
          min={min}
          max={isSingle ? max : endDate || max}
          onChange={handleStartDateChange}
        />
        {!isSingle && (
          <input
            type="date"
            value={endDate}
            min={startDate || min}
            max={max}
            onChange={handleEndDateChange}
          />
        )}
      </div>
    </div>
  );
};

export default DateSlicer;
