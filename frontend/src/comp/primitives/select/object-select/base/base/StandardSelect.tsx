import PopoverFloating from "../../../../../external/floating/pop-over/PopoverFloating";
import { memo, useMemo, useRef, useState, type JSX } from "react";
import styles from "./StandardSelect.module.css";
import clsx from "clsx";
import withClassName from "../../../../../../utils/withClassName";
import { ChevronDown } from "lucide-react";

interface IObjectSelect {
    defaultLabel?: string,
    isInitialOpen?: boolean,
    options: string[],
    icon?: JSX.Element,
    value: string | null,
    onChange: (value: string | null) => void,
    maxHeightToggle?: string,
    classNameTrigger?: string,
    classNameToggle?: string,
    classNameOption?: string,
    classNameOptionSelected?: string,
    classNameIcon?: string,
    classNamePopoverFloating?: string,
    classNameTriggerInvalid?: string,
    classNameTriggerValidate?: string,
}

const ObjectSelect = ({
    defaultLabel = 'Seleccione una opción',
    isInitialOpen = false,
    options,
    value,
    onChange,
    maxHeightToggle,
    icon,
    classNameTrigger,
    classNameToggle,
    classNameOption,
    classNameOptionSelected,
    classNameIcon,
    classNamePopoverFloating,
    classNameTriggerInvalid,
    classNameTriggerValidate,
}: IObjectSelect) => {

    const [isOpen, setIsOpen] = useState(isInitialOpen);

    // Funcion memoizada para obtener el icono con las classNames
    const iconWithClassNames = useMemo(() =>
        withClassName((icon ? icon : <ChevronDown />),
            clsx(styles.iconButton, classNameIcon)
        ), [icon, classNameIcon]);


    // Funcion para obtener las classNames del trigger y toggle
    const [triggerClassNames, toggleClassNames] = (() => {
        const triggerClassNames = clsx(
            styles.fieldSelectContainer,
            classNameTrigger,
            value === null || String(value) === defaultLabel
                ? classNameTriggerInvalid
                : classNameTriggerValidate
        );
        const toggleClassNames = clsx(
            styles.toggle,
            classNameToggle,
        );

        return [triggerClassNames, toggleClassNames];
    })();


    // Refs para navegación por flechas
    const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const optionsLen = options.length;

    // Funcion para enfocar una opción
    const focusAt = (i: number) => {
        if (!optionsLen) return;
        const next = (i + optionsLen) % optionsLen;
        const el = optionRefs.current[next];
        el?.focus({ preventScroll: true });
        el?.scrollIntoView({ block: "nearest" });
    };

    // Funcion memoizada para obtener el indice inicial o actual
    const initialIndex = useMemo(() => {
        if (!value) return 0;
        const i = options.findIndex(o => String(o) === String(value));
        return i >= 0 ? i : 0;
    }, [options, value]);

    // Navegar por flechas
    const navigateFrom = (from: number, delta: number) => {
        focusAt(from + delta);
    };

    // Abrir con flechas desde el trigger y enfocar opción actual
    const handleTriggerKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Space") return;
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
        // Espera a que se renderice el popover y enfoca
        requestAnimationFrame(() => {
            if (!optionsLen) return;
            const start =
                e.key === "ArrowDown"
                    ? initialIndex
                    : (initialIndex === 0 ? optionsLen - 1 : initialIndex);
            focusAt(start);
        });
    };

    return (
        <PopoverFloating
            matchWidth
            initialOpen={isInitialOpen}
            typeRole="select"
            placement="bottom"
            open={isOpen}
            setOpen={setIsOpen}
            {...(maxHeightToggle ? { maxHeight: maxHeightToggle } : {})}
            classNamePopoverFloating={classNamePopoverFloating}
            childrenTrigger={
                <button
                    className={triggerClassNames}
                    onKeyDown={handleTriggerKeyDown}
                >
                    {value ? String(value) : defaultLabel}
                    {iconWithClassNames}
                </button>
            }
            childrenFloating={
                <div className={toggleClassNames}>
                    {
                        options.map((option, index) => (
                            <ObjectOptionMemo
                                key={index}
                                option={option}
                                value={value}
                                onChange={onChange}
                                setIsOpen={setIsOpen}
                                classNameOption={classNameOption}
                                classNameOptionSelected={classNameOptionSelected}
                                index={index}
                                optionsLen={optionsLen}
                                navigateFrom={navigateFrom}
                                setRef={(i, el) => (optionRefs.current[i] = el)}
                            />
                        ))
                    }
                </div>
            }
        />
    )
};

const ObjectSelectMemo = memo(ObjectSelect) as typeof ObjectSelect;

export default ObjectSelectMemo;

interface IObjectOption {
    option: string,
    value: string | null,
    onChange: (value: string | null) => void,
    setIsOpen: (value: boolean) => void,
    classNameOption?: string,
    classNameOptionSelected?: string,
    index: number,
    optionsLen: number,
    navigateFrom: (from: number, delta: number) => void,
    setRef: (index: number, el: HTMLButtonElement | null) => void,
}

const ObjectOption = ({
    option,
    value,
    onChange,
    setIsOpen,
    classNameOption,
    classNameOptionSelected,
    index,
    optionsLen,
    navigateFrom,
    setRef,
}: IObjectOption) => {

    const optionLabel = String(option);
    const isSelected = value === option;

    const optionClassNames = clsx(
        clsx(styles.option, classNameOption),
        isSelected && classNameOptionSelected
    );

    // CLICK: acción central (mouse y teclado)
    const handleOnClick: React.MouseEventHandler<HTMLButtonElement> = () => {
        onChange?.(option);
        setIsOpen(false);
    };

    // MOUSEDOWN: evita blur del trigger antes del click y evita burbujeo
    const handleMouseDown: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // KEYDOWN: cancela el click sintético (Enter/Space) para que no reabra
    // KEYDOWN: Enter/Space seleccionan; flechas navegan; Home/End saltan; Escape cierra
    const handleOnKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            onChange?.(option);
            setIsOpen(false);
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            e.stopPropagation();
            navigateFrom(index, +1);
            return;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            e.stopPropagation();
            navigateFrom(index, -1);
            return;
        }
        if (e.key === "Home") {
            e.preventDefault();
            e.stopPropagation();
            navigateFrom(index, -index); // ir al primero
            return;
        }
        if (e.key === "End") {
            e.preventDefault();
            e.stopPropagation();
            navigateFrom(index, (optionsLen - 1) - index); // ir al último
            return;
        }
        if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(false);
            return;
        }
    };

    return (
        <button
            ref={(el) => setRef(index, el)}
            className={optionClassNames}
            type="button"
            onClick={handleOnClick}
            onMouseDown={handleMouseDown}
            onKeyDown={handleOnKeyDown}

        >
            {optionLabel}
        </button>
    )
}

const ObjectOptionMemo = memo(ObjectOption) as typeof ObjectOption;


/* 


    `¿Qué hace cada uno?

    preventDefault()
    Cancela la acción por defecto del navegador para ese evento.

    Ejemplos de “acción por defecto”:

    En un <button>, Enter o Space generan un click sintético.

    En Space, la página puede hacer scroll si el foco no está en un control.

    En mousedown, el navegador mueve el foco al elemento donde hiciste down (lo que puede causar blur del trigger).

    stopPropagation()
    Detiene que el evento siga subiendo por el árbol (fase de bubbling).
    Evita que ancestros (popover, contenedor, document) reciban el mismo evento y ejecuten sus propios handlers (p. ej., abrir/cerrar).

    Resumen mental:
    preventDefault = “no hagas lo que sueles hacer” (no hagas el click sintético, no hagas scroll, no cambies el foco).
    stopPropagation = “no se lo cuentes a mis papás” (no dejes que el contenedor se entere y haga su propia lógica).

    ¿Por qué son importantes en tu select/popover?
    Caso 1: Selección con teclado (Enter/Space) en una opción

    Problema: el botón de la opción cierra el popover en keydown, pero luego el navegador hace el click por defecto y ese click burbujea al trigger → puede reabrir el popover.

    Solución:

    preventDefault(): evita el click sintético.

    stopPropagation(): evita que el evento llegue al trigger o al document (que podrían togglear o cerrar/abrir).

    Caso 2: Selección con mouse/touch (mousedown → click)

    Problema: al hacer mousedown sobre una opción, el navegador intenta mover el foco a esa opción → el input/trigger pierde foco (blur) y tu “click fuera” puede cerrar el popover antes de que llegue el click de selección.

    Solución:

    preventDefault() en mousedown: impide el cambio de foco (evita el blur prematuro).

    (Opcional) stopPropagation() si hay listeners de mousedown en padres que no quieres disparar.

    Cuándo usar cada uno (checklist)

    En el trigger (botón que abre/cierra):

    Normalmente no uses preventDefault (quieres foco correcto en tap/teclado).

    Usa stopPropagation solo si el trigger está dentro de otro clickeable que no quieres activar.

    En cada opción del popover:

    mousedown → preventDefault() para evitar blur del trigger antes del click.

    keydown (Enter/Space) → preventDefault() + stopPropagation() para evitar:

    el click sintético (reabrir/doble acción),

    y que el evento burbujee a padres (toggle/close externos).

    click: aquí confirmas la selección (no canceles; quieres que ocurra).

    Qué pasa si te “olvidas” de…

    preventDefault() en Enter/Space (opción):
    Habrá click sintético luego de tu cierre → puede reabrir el popover o duplicar la acción.

    stopPropagation() en Enter/Space (opción):
    El evento sube y activa lógica del popover/trigger/document (toggle, close on outside, etc.).

    preventDefault() en mousedown (opción):
    El trigger pierde foco antes del click; tu lógica de “close on blur / outside” puede cerrar el popover antes de seleccionar.
`
*/

