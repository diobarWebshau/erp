import { useState } from 'react';
import { DateInput } from '@mantine/dates';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from "dayjs";
import styles from "./DateInputMantine.module.css";
import "dayjs/locale/es"; // para cambiar el idioma


function DateInputMantine() {
  const [value, setValue] = useState<Date | null>(null);


  const onChange = (value: string | null) => {
    setValue(dayjs(value).toDate());
  };
  const weekdayFormat = (date: string) => {
    const abbr = dayjs(date).locale("es").format("dd");
    return abbr.charAt(0).toUpperCase();
  };

  return (
    <DateInput
      value={value}
      onChange={onChange}
      headerControlsOrder={['level', 'previous', 'next']}
      weekdayFormat={weekdayFormat}
      locale="es"

      placeholder="Selecciona una fecha"
      rightSection={<Calendar size={18} color="blue" />}
      rightSectionPointerEvents="none" // evita que tape el input
      classNames={{
        // Wrapper del input
        root: styles.root, // contenedor que contiene tanto el label como el input
        wrapper: styles.wrapper, // contenedor que contiene el input
        label: `nunito-regular ${styles.label}`, // label
        input: `nunito-regular ${styles.input}`, // input
        description: `nunito-regular ${styles.description}`, // description
        error: `nunito-regular ${styles.error}`, // error
        required: styles.required, // required
        section: styles.section, // section donde se encuentra el icono del input
        // ROOT 
        levelsGroup: styles.levelsGroup, // Contenedor principal de los niveles 
        // ENCAEZADO
        calendarHeader: styles.calendarHeader, // Contenedor del encabezado
        calendarHeaderLevel: `nunito-bold ${styles.calendarHeaderLevel}`, // Label donde se muestra el mes y año
        calendarHeaderControl: styles.calendarHeaderControl, // Botones de control
        // calendarHeaderControlIcon: styles.calendarHeaderControlIcon // Iconos de los controles por defecto
        // TABLE -->  CONTENIDO DEL MES
        monthThead: styles.monthThead,
        monthTbody: styles.monthTbody,
        weekdaysRow: styles.weekdaysRow,
        weekNumber: styles.weekNumber,
        weekday: styles.weekday,
        monthCell: styles.monthCell,
        day: `nunito-regular ${styles.day}`,
      }}
      withCellSpacing={true}
      nextIcon={<ChevronRight className={styles.iconControl} />}
      previousIcon={<ChevronLeft className={styles.iconControl} />}
      popoverProps={{
        classNames: {
          dropdown: styles.dropdown,
        },
        // styles: {
        //   dropdown: {
        //     padding: "0rem",
        //     borderRadius: "15px",
        //     border: "1px solid var(--color-theme-border-table)",
        //   }
        // },
      }}
    />
  );
}

export default DateInputMantine;
