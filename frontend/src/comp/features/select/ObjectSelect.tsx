import { memo, useCallback, useEffect, useMemo, useState } from "react";
import PopoverFloating from "../../../comp/external/floating/pop-over/PopoverFloating";
import styles from "./StandardSelect.module.css";
import withClassName from "../../../utils/withClassName";
import { ChevronDownIcon } from "lucide-react";
import clsx from "clsx";

interface IObjectSelect<T> {
    value: T | null;
    options: T[];
    labelKey: keyof T;
    onChange: (value: T | null) => void;
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
    classNameTriggerDisabled?: string;
}

const ObjectSelect = <T,>({
    initialOpen = false,
    value,
    options,
    labelKey,
    onChange,
    placeholder = "Selecciona una opción",
    disabled = false,
    mainColor,
    classNamePopoverFloating,
    classNameTrigger,
    classNameTriggerInvalid,
    classNameOption,
    classNameOptionSelected,
    withValidation = false,
    classNameTriggerDisabled,
}: IObjectSelect<T>) => {

    const [open, setOpen] = useState<boolean>(initialOpen);
    const [listOptions, setListOptions] = useState<T[]>(options);

    const toggleOpen = useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

    const selectedLabel = useMemo(() => {
        return value ? String(value[labelKey]) : placeholder;
    }, [value, labelKey, placeholder]);

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
            disabled={disabled}
            childrenTrigger={
                <SelectTriggerMemo
                    selectedLabel={selectedLabel}
                    disabled={disabled}
                    placeholder={placeholder}
                    toggleOpen={toggleOpen}
                    mainColor={mainColor}
                    classNameTrigger={classNameTrigger}
                    classNameTriggerInvalid={classNameTriggerInvalid}
                    withValidation={withValidation}
                    classNameTriggerDisabled={classNameTriggerDisabled}
                />
            }
            childrenFloating={
                <FloatingComponentMemo
                    listOptions={listOptions}
                    value={value}
                    toggleOpen={toggleOpen}
                    labelKey={labelKey}
                    onChange={onChange}
                    classNameOption={classNameOption}
                    classNameOptionSelected={classNameOptionSelected}
                />
            }
            classNamePopoverFloating={className}
        />
    )
}

const ObjectSelectMemo = memo(ObjectSelect) as typeof ObjectSelect;

export default ObjectSelectMemo;


// * ************ SELECT TRIGGER ************ 

interface ISelectTrigger {
    placeholder: string,
    selectedLabel: string,
    toggleOpen: () => void
    mainColor: string;
    classNameTrigger?: string;
    classNameTriggerInvalid?: string;
    withValidation?: boolean;
    disabled?: boolean;
    classNameTriggerDisabled?: string;
}

const SelectTrigger = ({
    placeholder,
    selectedLabel,
    toggleOpen,
    mainColor,
    classNameTrigger,
    classNameTriggerInvalid,
    withValidation,
    disabled = false,
    classNameTriggerDisabled
}: ISelectTrigger) => {

    const iconWithClass = useMemo(() => withClassName(<ChevronDownIcon />, styles.icon, { color: mainColor }), [mainColor]);

    const handleOnClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        toggleOpen();
    }, [toggleOpen]);

    const className = useMemo(() => {
        return clsx(
            styles.fieldSelectContainer,
            classNameTrigger,
            disabled ? classNameTriggerDisabled : "",
            (!disabled && withValidation) ? (
                (placeholder === selectedLabel)
                    ? `${styles.invalidValue} ${classNameTriggerInvalid}`
                    : ""
            ) : "",
        );
    }, [selectedLabel, placeholder, classNameTriggerInvalid, classNameTrigger, withValidation, disabled, classNameTriggerDisabled]);

    return (
        <div
            onClick={handleOnClick}
            tabIndex={disabled ? -1 : 0}
            className={className}
        >
            {selectedLabel}
            {iconWithClass}
        </div>
    )
}

const SelectTriggerMemo = memo(SelectTrigger) as typeof SelectTrigger;

// * ************ FloatingComponent ************ */

interface IFloatingComponent<T> {
    listOptions: T[];
    value: T | null;
    toggleOpen: () => void;
    labelKey: keyof T;
    onChange: (value: T | null) => void;
    classNameOption?: string;
    classNameOptionSelected?: string;
}

const FloatingComponent = <T,>({
    listOptions,
    value,
    toggleOpen,
    labelKey,
    onChange,
    classNameOption,
    classNameOptionSelected
}: IFloatingComponent<T>) => {
    return (
        <div
            className={styles.floatingComponent}
        >
            {
                listOptions.map((option) =>
                    <OptionComponent
                        option={option}
                        value={value}
                        labelKey={labelKey}
                        onChange={onChange}
                        toggleOpen={toggleOpen}
                        classNameOption={classNameOption}
                        classNameOptionSelected={classNameOptionSelected}
                    />
                )
            }
        </div>
    )
}


interface IOptionComponent<T> {
    option: T,
    labelKey: keyof T,
    value: T | null,
    toggleOpen: () => void,
    onChange: (value: T | null) => void,
    classNameOption?: string,
    classNameOptionSelected?: string
}

const OptionComponent = <T,>({
    option, labelKey, value, toggleOpen, onChange,
    classNameOption, classNameOptionSelected
}: IOptionComponent<T>) => {

    const label = String(option[labelKey]);
    const isSelected = value?.[labelKey] === option[labelKey];

    const handleOnClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        onChange(option);
        toggleOpen();
    }, [option, onChange, toggleOpen]);

    const handleOnKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            onChange(option);
            toggleOpen();
        }
    }, [option, toggleOpen, onChange]);

    const className = useMemo(() => clsx(
        styles.option,
        isSelected ? `${styles.selected} ${classNameOptionSelected}` : "",
        classNameOption
    ), [isSelected, classNameOption, classNameOptionSelected]);

    return (
        <div
            key={String(option[labelKey])}
            onClick={handleOnClick}
            onKeyDown={handleOnKeyDown}
            tabIndex={0}
            className={className}
        >
            {label}
        </div>
    );
}

const FloatingComponentMemo = memo(FloatingComponent) as typeof FloatingComponent;

