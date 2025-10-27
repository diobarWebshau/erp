import { DateInput } from '@mantine/dates';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from "./DateInputMantine.module.css";
import { useState } from "react";
import { DateUtils } from "../../../../../../utils/dayJsUtils";

interface IDateInputMantine {
  value: Date | null; // Fecha actual seleccionada, puede ser null
  onChange: (value: Date | null) => void; // Callback al cambiar la fecha
  classNameInput?: string; // Clase opcional para personalizar el contenedor principal
  positionPopover: "bottom" | "top" | "left" | "right" | "bottom-start" | "bottom-end" | "top-start" | "top-end" | "left-start" | "left-end" | "right-start" | "right-end"
  min?: Date,
  max?: Date,
  withValidate?: boolean
}

function DateInputMantine({
  value,
  onChange,
  classNameInput,
  positionPopover,
  min,
  max,
  withValidate = false
}: IDateInputMantine) {

  const [isValidDate, setIsValidDate] = useState<boolean>(DateUtils.isValid(value));

  // ---------------------------------------------------------------------------
  // Función que se llama al cambiar el valor del input
  // Recibe un string o null (de Mantine DateInput)
  // Convierte el string a un objeto Date usando dayjs y lo pasa a onChange
  // ---------------------------------------------------------------------------
  const onChangeDate = (value: string | null) => {
    if (DateUtils.isValid(value)) {
      if (!isValidDate) {
        setIsValidDate(true);
      }
      onChange(DateUtils.toDate(value)); // parsea y convierte a Date
    } else {
      if (isValidDate) {
        setIsValidDate(false);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Función para mostrar abreviatura de los días de la semana
  // Ejemplo: lunes -> "L", martes -> "M"
  // ---------------------------------------------------------------------------
  const weekdayFormat = (date: string) => {
    const abbr = DateUtils.parse(date).locale("es").format("dd"); // abreviatura de dos letras
    return abbr.charAt(0).toUpperCase(); // tomamos la primera letra y la ponemos en mayúscula
  };

  return (
    <DateInput
      value={value} // Fecha actual seleccionada
      onChange={onChangeDate} // Callback al cambiar la fecha
      valueFormat="MM/DD/YYYY" // Formato de visualización en el input
      headerControlsOrder={['level', 'previous', 'next']} // Orden de los controles del header
      weekdayFormat={weekdayFormat} // Función para mostrar los días de la semana
      locale="es" // Idioma español
      {...(min ? { minDate: min } : {})}
      {...(max ? { maxDate: max } : {})}
      placeholder="Selecciona una fecha" // Texto cuando no hay valor
      rightSection={<Calendar size={18} color="blue" />} // Icono del calendario dentro del input
      rightSectionPointerEvents="none" // Evita que el icono bloquee la interacción con el input
      // -----------------------------------------------------------------------
      // Clases CSS personalizadas usando CSS Modules y clases globales
      // -----------------------------------------------------------------------
      classNames={{
        root: styles.root, // Contenedor principal que envuelve label + input
        wrapper: styles.wrapper, // Contenedor que envuelve solo el input
        label: `nunito-regular ${styles.label}`, // Estilo del label
        input: `${classNameInput} nunito-regular ${styles.input} ${isValidDate ? styles.inputValid : withValidate ? styles.inputInvalid : ""}`, // Estilo del input
        description: `nunito-regular ${styles.description}`, // Estilo del texto de ayuda
        error: `nunito-regular ${styles.error}`, // Estilo del mensaje de error
        required: styles.required, // Estilo del indicador de campo requerido
        section: styles.section, // Contenedor del rightSection (icono del calendario)

        // -------------------------------------------------------------------
        // Contenedor del calendario
        // -------------------------------------------------------------------
        levelsGroup: styles.levelsGroup, // Contenedor principal de los niveles del calendario (mes/año)
        calendarHeader: styles.calendarHeader, // Contenedor del encabezado del calendario
        calendarHeaderLevel: `nunito-bold ${styles.calendarHeaderLevel}`, // Mes y año en el encabezado
        calendarHeaderControl: styles.calendarHeaderControl, // Botones prev/next

        // -------------------------------------------------------------------
        // Contenido del mes
        // -------------------------------------------------------------------
        monthThead: `nunito-regular ${styles.monthThead}`, // Encabezado de los días de la semana
        monthTbody: styles.monthTbody, // Cuerpo del calendario
        weekdaysRow: styles.weekdaysRow, // Fila de días de la semana
        weekNumber: styles.weekNumber, // Número de la semana (si aplica)
        weekday: `nunito-regular ${styles.weekday}`, // Celda de cada día de la semana
        monthCell: styles.monthCell, // Celda de cada día del mes
        day: `nunito-regular ${styles.day}`, // Estilo del día individual
        
      }}

      withCellSpacing={true} // Espacio entre las celdas del calendario

      // -----------------------------------------------------------------------
      // Iconos de navegación del calendario
      // -----------------------------------------------------------------------
      nextIcon={<ChevronRight className={styles.iconControl} />} // Botón siguiente
      previousIcon={<ChevronLeft className={styles.iconControl} />} // Botón anterior

      // -----------------------------------------------------------------------
      // Props para personalizar el popover del calendario
      // -----------------------------------------------------------------------
      popoverProps={{
        ...(positionPopover ? { position: positionPopover } : {}),
        classNames: {
          dropdown: styles.dropdown, // Estilo del popover
        },
        // Si quieres personalizar el estilo directamente:
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
