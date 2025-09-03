// ReactDayPickerField.portal.tsx
import React, {
    useEffect,
    useId,
    useRef,
    useState,
    type ReactNode,
} from "react";
import ReactDOM from "react-dom";
import {
    format, isValid,
    parse
} from "date-fns";
import { DayPicker } from "react-day-picker";
import stylesModules from "./ReactDayPickerField.module.css";
import {
    useClickOutside
} from "../../table/customHooks/useClickOutside";
import {
    useFloating,
    offset, flip,
    shift, autoUpdate
} from "@floating-ui/react-dom";

interface ReactDayPickerFieldProps {
    label?: string;
    icon?: ReactNode;
    value?: Date;
    classNameLabel?: string;
    classNameField?: string;
    classNameInput?: string;
    classNameButton?: string;
    classNameContainer?: string;
    classNamePopover?: string;
    classNameDayPicker?: string;
    onChange?: (date: Date | undefined) => void;
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
    const dialogId = useId();

    const [month, setMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(value ?? undefined);
    const [inputValue, setInputValue] = useState(value ? format(value, "MM/dd/yyyy") : "");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Floating UI refs separados para referencia y floating
    const floatingRef = useRef<HTMLElement | null>(null);
    const referenceRef = useRef<HTMLElement | null>(null);

    // useFloating hook con middleware igual que el ejemplo
    const { x, y, strategy, refs, update, floatingStyles } = useFloating({
        placement: "bottom-start",
        middleware: [offset(6), flip(), shift({ padding: 8 })],
    });

    // Sincronizar refs locales con refs de floating-ui
    const setFloating = (node: HTMLElement | null) => {
        floatingRef.current = node;
        refs.setFloating(node);
    };
    const setReference = (node: HTMLElement | null) => {
        referenceRef.current = node;
        refs.setReference(node);
    };

    // autoUpdate para que el popover se reposicione automáticamente mientras está abierto
    useEffect(() => {
        if (!isDialogOpen) return;
        if (!referenceRef.current || !floatingRef.current) return;

        const cleanup = autoUpdate(referenceRef.current, floatingRef.current, update);

        return () => {
            cleanup();
        };
    }, [isDialogOpen, update]);

    // Portal root para reutilizar o crear nodo portal
    const portalRoot = useRef<Element | null>(null);
    useEffect(() => {
        if (typeof document !== "undefined") {
            let existingRoot = document.getElementById("floating-ui-portal-root");
            if (!existingRoot) {
                existingRoot = document.createElement("div");
                existingRoot.setAttribute("id", "floating-ui-portal-root");
                existingRoot.style.position = "fixed";
                existingRoot.style.zIndex = "99999";
                document.body.appendChild(existingRoot);
            }
            portalRoot.current = existingRoot;
        }
    }, []);

    // Cerrar al hacer click fuera
    useClickOutside(
        [floatingRef, referenceRef],
        () => setIsDialogOpen(false)
    );

    // Manejo toggle del popover
    const toggleDialog = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsDialogOpen((prev) => !prev);
    };

    // Selección fecha
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

    // Cambio texto input
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
        <div className={`${stylesModules.container} ${classNameContainer ?? ""}`}>
            {
                label &&
                <label
                    htmlFor="date-input"
                    className={`${stylesModules.dateLabel} ${classNameLabel ?? ""}`}
                >
                    {label}
                </label>
            }
            <div className={`${stylesModules.dateField} ${classNameField ?? ""}`}>
                <input
                    className={`${stylesModules.dateInput} ${classNameInput ?? ""}`}
                    id="date-input"
                    type="text"
                    value={inputValue}
                    placeholder="MM/dd/yyyy"
                    onChange={handleInputChange}
                />
                <button
                    ref={setReference}
                    className={`${stylesModules.dateButton} ${classNameButton ?? ""}`}
                    onClick={toggleDialog}
                    aria-controls={dialogId}
                    aria-haspopup="dialog"
                    aria-expanded={isDialogOpen}
                    aria-label="Open calendar to choose booking date"
                    type="button"
                >
                    {icon}
                </button>
            </div>

            {isDialogOpen && portalRoot.current &&
                ReactDOM.createPortal(
                    <div
                        id={dialogId}
                        ref={setFloating}
                        role="dialog"
                        aria-modal="true"
                        className={`${stylesModules.datePopover} ${classNamePopover ?? ""}`}
                        style={{
                            position: strategy,
                            top: y ?? 0,
                            left: x ?? 0,
                            ...floatingStyles,
                            padding: 8,
                            zIndex: 1000,
                            minWidth: 280,
                        }}
                    >
                        <DayPicker
                            month={month}
                            onMonthChange={setMonth}
                            autoFocus
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDayPickerSelect}
                            className={classNameDayPicker ?? ""}
                        />
                    </div>,
                    portalRoot.current
                )
            }
        </div>
    );
};

export default ReactDayPickerField;
