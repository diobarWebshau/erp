import { DatePicker } from "@mantine/dates";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useEffect, useState } from "react";
import styles from "./RangeDayPickerMantine.module.css";
import dayjs from "dayjs";
import type { ObjectDateFilter } from "../../../../../../../interfaces/tableTypes";

interface RangeDayPickerMantineProps {
    value: ObjectDateFilter;
    onChange: (value: ObjectDateFilter) => void;
}

const RangeDayPickerMantine = memo(({
    value,
    onChange
}: RangeDayPickerMantineProps) => {


    const [range, setRange] = useState<[Date | null, Date | null]>(value.from && value.to ? [value.from, value.to] : [null, null]);

    const handleDateChangeRange = (date: [string | null, string | null] | null) => {
        if (!date) return;

        const parsedDate = date.map((d) => d ? dayjs(d).toDate() : null);

        const newRange: [Date | null, Date | null] = [
            parsedDate[0],
            parsedDate[1],
        ];

        const objectDate: ObjectDateFilter = {
            from: parsedDate[0] ?? undefined,
            to: parsedDate[1] ?? undefined
        }

        setRange(newRange);
        onChange(objectDate);
    };

    const weekdayFormat = (date: string) => {
        const abbr = dayjs(date).locale("es").format("dd");
        return abbr.charAt(0).toUpperCase();
    };

    useEffect(() => {
        const { from, to } = value;
        const parsedDate = [from, to].filter((d) => d !== undefined);
        setRange([parsedDate[0], parsedDate[1]]);
    }, [value]);

    return (
        <DatePicker
            value={range}
            type="range"
            onChange={handleDateChangeRange}
            headerControlsOrder={['level', 'previous', 'next']}
            locale="es"
            weekdayFormat={weekdayFormat}
            withCellSpacing={true}
            classNames={{
                // ROOT 
                levelsGroup: styles.levelsGroup, // Contenedor principal de los niveles 
                // ENCAEZADO
                calendarHeader: styles.calendarHeader, // Contenedor del encabezado
                calendarHeaderLevel: `nunito-bold ${styles.calendarHeaderLevel}`, // Label donde se muestra el mes y año
                calendarHeaderControl: styles.calendarHeaderControl, // Botones de control
                // calendarHeaderControlIcon: styles.calendarHeaderControlIcon // Iconos de los controles por defecto
                datePickerRoot: styles.datePickerRoot,
                // TABLE -->  CONTENIDO DEL MES
                monthThead: styles.monthThead,
                monthTbody: styles.monthTbody,
                weekdaysRow: styles.weekdaysRow,
                weekNumber: styles.weekNumber,
                weekday: styles.weekday,
                monthCell: styles.monthCell,
                day: `nunito-regular ${styles.day}`,

            }}
            nextIcon={<ChevronRight className={styles.iconControl} />}
            previousIcon={<ChevronLeft className={styles.iconControl} />}

        />
    )
});

export default RangeDayPickerMantine
