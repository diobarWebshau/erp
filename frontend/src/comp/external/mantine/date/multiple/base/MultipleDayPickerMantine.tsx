import { DatePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { useState, useEffect, memo } from "react";
import styles from "./MultipleDayPickerMantine.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";


interface MultipleDayPickerMantineProps {
    value: Date[];
    onChange: (value: Date[]) => void;
}

const MultipleDayPickerMantine = memo(({
    value,
    onChange
}: MultipleDayPickerMantineProps) => {

    const [multipleDates, setMultipleDates] = useState<Date[]>([]);

    const handleDateChangeMultiple = (date: string[]) => {
        const parsedDate = date.map((d) => dayjs(d).toDate());
        setMultipleDates(parsedDate);
        onChange(parsedDate);
    };

    const weekdayFormat = (date: string) => {
        const abbr = dayjs(date).locale("es").format("dd");
        return abbr.charAt(0).toUpperCase();
    };

    useEffect(() => {
        setMultipleDates(value);
    }, [value]);

    return (
        <DatePicker
            value={multipleDates}
            type="multiple"
            onChange={handleDateChangeMultiple}
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


export default MultipleDayPickerMantine
