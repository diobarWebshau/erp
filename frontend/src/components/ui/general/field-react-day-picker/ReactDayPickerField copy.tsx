import {
    useEffect,
    useId,
    useRef,
    useState,
    type ReactNode
} from "react";

import {
    format, isValid, parse
} from "date-fns";
import {
    DayPicker
} from "react-day-picker";
import stylesModules
    from "./ReactDayPickerField.module.css";

interface ReactDayPickerFieldProps {
    label: string,
    icon?: ReactNode,
    value?: Date,
    classNameLabel?: string,
    classNameField?: string,
    classNameInput?: string,
    classNameButton?: string,
    classNameContainer?: string,
    classNamePopover?: string,
    classNameDayPicker?: string,
    onChange?: (date: Date | undefined) => void,
}

const ReactDayPickerField = ({
    label,
    icon,
    value,
    onChange,
    classNameLabel,
    classNameField,
    classNameInput,
    classNameButton,
    classNameContainer,
    classNamePopover,
    classNameDayPicker,
}: ReactDayPickerFieldProps) => {
    // ? ************ Hooks ************/

    // hook para generar un id unico
    const dialogId = useId();

    // ? ************ Estados ************/ 

    // objeto Date que se pasa al DayPicker para que muestre el mes actual
    const [month, setMonth] =
        useState(new Date());
    // fecha seleccionada
    const [selectedDate, setSelectedDate] =
        useState<Date | undefined>(value ?? undefined);
    // valor del input
    const [inputValue, setInputValue] =
        useState(value ? format(value, "MM/dd/yyyy") : "");
    // estado para controlar el dialogo
    const [isDialogOpen, setIsDialogOpen] =
        useState(false);

    // ? ************ Funciones ************/

    // funcion para abrir y cerrar el dialogo
    const toggleDialog = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsDialogOpen((prev) => !prev);
    };

    // funcion para manejar la seleccion de una fecha
    const handleDayPickerSelect = (date: Date | undefined) => {
        if (!date) {
            setInputValue("");
            setSelectedDate(undefined);
            onChange?.(undefined);
        } else {
            setSelectedDate(date);
            setInputValue(format(date, "MM/dd/yyyy"));
            onChange?.(date);
        }
        setIsDialogOpen(false);
    };

    // funcion para manejar el cambio del input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);

        const parsedDate = parse(e.target.value, "MM/dd/yyyy", new Date());
        if (isValid(parsedDate)) {
            setSelectedDate(parsedDate);
            onChange?.(parsedDate);
            setMonth(parsedDate);
        } else {
            setSelectedDate(undefined);
            onChange?.(undefined);
        }
    };

    return (
        <div
            className={
                `${stylesModules.container} `
                + ` ${classNameContainer ? classNameContainer : ""}`
            }
        >
            <label
                htmlFor="date-input"
                className={`${stylesModules.dateLabel} `
                    + `${classNameLabel ? classNameLabel : ""}`}>
                {label}
            </label>
            <div
                className={
                    `${stylesModules.dateField}`
                    + ` ${classNameField ? classNameField : ""}`
                }
            >
                <input
                    className={
                        `${stylesModules.dateInput} `
                        + ` ${classNameInput ? classNameInput : ""}`
                    }
                    id="date-input"
                    type="text"
                    value={inputValue}
                    placeholder="MM/dd/yyyy"
                    onChange={handleInputChange}
                />
                <button
                    className={
                        `${stylesModules.dateButton} `
                        + ` ${classNameButton ? classNameButton : ""}`
                    }
                    onClick={toggleDialog}
                    aria-controls={dialogId}
                    aria-haspopup="dialog"
                    aria-expanded={isDialogOpen}
                    aria-label="Open calendar to choose booking date"
                >
                    {icon}
                </button>
            </div>
            {isDialogOpen && (
                <div
                    className={
                        `${stylesModules.datePopover}` +
                        `${classNamePopover ? classNamePopover : ""}`
                    }
                    id={dialogId}
                >
                    <DayPicker
                        month={month}
                        onMonthChange={setMonth}
                        autoFocus
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDayPickerSelect}
                        className={classNameDayPicker}
                    />
                </div>
            )}
        </div>
    );
}

export default ReactDayPickerField;
