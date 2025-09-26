import React, { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import styles from "./DateDayPicker.module.css";
import "react-day-picker/dist/style.css";
import type { ColumnTypeDataFilter } from "../../../types";

type Props = {
    initialRange?: DateRange;
    setInitialValue?: Dispatch<
        SetStateAction<ColumnTypeDataFilter | undefined>
    >;
    initialDate?: Date;
    onChange?: (rangeOrDate: DateRange | Date | undefined) => void;
    numberOfMonths?: number;
    className?: string;
    type?: "range" | "single";
    required?: boolean;
};

const DateRangePicker: React.FC<Props> = ({
    initialRange,
    initialDate,
    onChange,
    numberOfMonths = 2,
    className,
    type = "range",
    required = false,
    setInitialValue
}) => {
    const [range, setRange] =
        useState<DateRange | undefined>(initialRange);
    const [date, setDate] =
        useState<Date | undefined>(initialDate);

    const handleRangeSelect = (
        selectedRange: DateRange | undefined
    ) => {
        setRange(selectedRange);
        onChange?.(selectedRange);
        setInitialValue?.({
            from: selectedRange?.from,
            to: selectedRange?.to
        });
    };

    const handleSingleSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        onChange?.(selectedDate);
        setInitialValue?.({
            from: selectedDate,
            to: selectedDate
        });
    };

    useEffect(() => {
        if (type === "range") {
            if (initialRange) {
                setRange(initialRange);
            }
        } else {
            if (initialDate) {
                setDate(initialDate);
            }
        }
    }, [initialRange, initialDate, type]);

    return (
        <div className={styles.wrapper}>
            {type === "range" ? (
                <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={handleRangeSelect}
                    numberOfMonths={numberOfMonths}
                    pagedNavigation
                    className={`${styles.calendar} ${className ?? ""}`}
                    required={required}
                />
            ) : (
                <DayPicker
                    mode="single"
                    selected={date}
                    onSelect={handleSingleSelect}
                    numberOfMonths={1}
                    className={`${styles.calendar} ${className ?? ""}`}
                    required={required}
                />
            )}
        </div>
    );
};

export default DateRangePicker;
