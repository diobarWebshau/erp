import { useState } from "react";
import DatePickerMantine from "../../../comp/external/mantine/date/datePicker/DatePickerMantine";
import { DatePicker } from "@mantine/dates";
import styles from "./NotFound.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "dayjs/locale/es"; // para cambiar el idioma

const NotFound = () => {

    const [value, setValue] = useState<Date>(new Date());

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "600px",
                height: "auto",
                backgroundColor: "rgba(240, 255, 174, 0.712)",
                padding: "5rem",
                gap: "1rem",
            }}
        >
            <DatePicker
                defaultDate="2022-02-01"
                headerControlsOrder={['level', 'previous', 'next']}
                locale="es"
                classNames={{
                    // ROOT 
                    levelsGroup: styles.levelsGroup, // Contenedor principal de los niveles 
                    // ENCAEZADO
                    calendarHeader: styles.calendarHeader, // Contenedor del encabezado
                    calendarHeaderLevel: `nunito-bold ${styles.calendarHeaderLevel}`, // Label donde se muestra el mes y año
                    calendarHeaderControl: styles.calendarHeaderControl, // Botones de control
                    // calendarHeaderControlIcon: styles.calendarHeaderControlIcon // Iconos de los controles por defecto
                    datePickerRoot: styles.datePickerRoot,
                    // Fila de dias de la semana
                    monthThead: styles.monthThead,
                    weekdaysRow: styles.weekdaysRow,
                    weekNumber: styles.weekNumber,
                    weekday: styles.weekday,
                    monthTbody: styles.monthTbody,
                }}
                nextIcon={<ChevronRight className={styles.iconControl} />} 
                previousIcon={<ChevronLeft className={styles.iconControl} />}
            />
        </div>
    );
};

export default NotFound;
