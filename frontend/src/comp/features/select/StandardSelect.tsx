import { memo, useCallback, useEffect, useMemo, useState} from "react";
import PopoverFloating from "../../../comp/external/floating/pop-over/PopoverFloating";
import styles from "./StandardSelect.module.css";
import withClassName from "../../../utils/withClassName";
import { ChevronDownIcon } from "lucide-react";
import clsx from "clsx";

interface IStandardSelect<T extends string> {
    value: T | null;
    options: T[];
    onChange: (value: T) => void;
    placeholder?: string;
    disabled?: boolean;
    initialOpen?: boolean;
    mainColor: string;
    classNamePopoverFloating?: string;
    classNameTrigger?: string;
    classNameTriggerInvalid?: string;
    classNameOption?: string;
    classNameOptionSelected?: string;
    withValidation?: boolean;

}

const StandardSelect = <T extends string>({
    initialOpen = false,
    value,
    options,
    onChange,
    placeholder = "Selecciona una opción",
    // disabled,
    mainColor,
    classNamePopoverFloating,
    classNameTrigger,
    classNameTriggerInvalid,
    classNameOption,
    classNameOptionSelected,
    withValidation = false,
}: IStandardSelect<T>) => {

    const [open, setOpen] = useState<boolean>(initialOpen);
    const [listOptions, setListOptions] = useState<T[]>(options);

    const toggleOpen = useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

    const selectedLabel = useMemo(() => {
        return value ? String(value) : placeholder;
    }, [value, placeholder]);

    useEffect(() => {
        setListOptions(options);
    }, [options]);

    const className = clsx(
        styles.containerPopover,
        classNamePopoverFloating,
    );

    return (
        <PopoverFloating
            open={open}
            setOpen={setOpen}
            childrenTrigger={
                <SelectTriggerMemo
                    value={value}
                    selectedLabel={selectedLabel}
                    toggleOpen={toggleOpen}
                    mainColor={mainColor}
                    classNameTrigger={classNameTrigger}
                    classNameTriggerInvalid={classNameTriggerInvalid}
                    withValidation={withValidation}
                />
            }
            childrenFloating={
                <FloatingComponentMemo
                    listOptions={listOptions}
                    value={value}
                    toggleOpen={toggleOpen}
                    onChange={onChange}
                    classNameOption={classNameOption}
                    classNameOptionSelected={classNameOptionSelected}
                />
            }
            classNamePopoverFloating={className}
        />
    )
}

const StandardSelectMemo = memo(StandardSelect) as typeof StandardSelect;

export default StandardSelectMemo;


// * ************ SELECT TRIGGER ************ 

interface ISelectTrigger<T extends string> {
    value: T | null,
    selectedLabel: string,
    toggleOpen: () => void
    mainColor: string;
    classNameTrigger?: string;
    classNameTriggerInvalid?: string;
    withValidation?: boolean;
}

const SelectTrigger = <T extends string>({
    value,
    selectedLabel,
    toggleOpen,
    mainColor,
    classNameTrigger,
    classNameTriggerInvalid,
    withValidation
}: ISelectTrigger<T>) => {

    const iconWithClass = useMemo(
        () => withClassName(
            <ChevronDownIcon />, styles.icon,
            { color: mainColor }), [mainColor]
    );

    const handleOnClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        toggleOpen();
    }, [toggleOpen]);

    const className = useMemo(() => {
        return clsx(
            styles.fieldSelectContainer,
            classNameTrigger,
            withValidation ? (
                (value && value === selectedLabel)
                    ? `${styles.invalidValue} ${classNameTriggerInvalid}`
                    : ""
            ) : "",
        );
    }, [value, selectedLabel]);

    return (
        <div
            onClick={handleOnClick}
            tabIndex={0}
            className={className}
        >
            {selectedLabel}
            {iconWithClass}
        </div>
    )
}

const SelectTriggerMemo = memo(SelectTrigger) as typeof SelectTrigger;

// * ************ FloatingComponent ************ */

interface IFloatingComponent<T extends string> {
    listOptions: T[];
    value: T | null;
    toggleOpen: () => void;
    onChange: (value: T) => void;
    classNameOption?: string;
    classNameOptionSelected?: string;
}

const FloatingComponent = <T extends string>({
    listOptions,
    value,
    toggleOpen,
    onChange,
    classNameOption,
    classNameOptionSelected
}: IFloatingComponent<T>) => {
    return (
        <div
            className={styles.floatingComponent}
        >
            {
                listOptions.map((option, index) => {

                    const label = String(option);
                    const isSelected = value === option;

                    const handleOnClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onChange(option);
                        toggleOpen();
                    }, [option, toggleOpen]);

                    const handleOnKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            onChange(option);
                            toggleOpen();
                        }
                    }, [option]);

                    const className = useMemo(
                        () => clsx
                            (`${styles.option} ${isSelected ? `${styles.selected} ${classNameOptionSelected}` : ""}`, classNameOption),
                        [styles.option, isSelected, classNameOption, classNameOptionSelected]
                    );

                    return (
                        <div
                            key={index}
                            onClick={handleOnClick}
                            onKeyDown={handleOnKeyDown}
                            tabIndex={0}
                            className={className}
                        >
                            {label}
                        </div>
                    )
                })
            }
        </div>
    )
}

const FloatingComponentMemo = memo(FloatingComponent) as typeof FloatingComponent;

