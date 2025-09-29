import { ChevronLeft, ChevronRight } from "lucide-react";
import { DatePicker } from "@mantine/dates";
import styles from "./StandardDayPickedMantine.module.css";
import dayjs from "dayjs";
import { memo, useEffect, useState } from "react";

interface StandardDayPickedMantineProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
}

const StandardDayPickedMantine = memo(({
    value,
    onChange
}: StandardDayPickedMantineProps) => {

    const [selectedValue, setSelectedValue] = useState<Date | null>(value ?? new Date());

    const handleDateChange = (date: string | null) => {
        if (date) {
            const parsedDate = dayjs(date).toDate();
            setSelectedValue(parsedDate);
            onChange(parsedDate);
        } else {
            setSelectedValue(null);
            onChange(null);
        }
    };

    const weekdayFormat = (date: string) => {
        const abbr = dayjs(date).locale("es").format("dd");
        return abbr.charAt(0).toUpperCase();
    };

    useEffect(() => {
        setSelectedValue(value);
    }, [value]);

    return (
        <div>
            <DatePicker
                value={selectedValue}
                type="default"
                onChange={handleDateChange}
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
                    day: styles.day,

                }}
                nextIcon={<ChevronRight className={styles.iconControl} />}
                previousIcon={<ChevronLeft className={styles.iconControl} />}
            />
        </div>
    );
});


export default StandardDayPickedMantine;
