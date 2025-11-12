import { memo, useCallback, useEffect, useMemo, useState } from "react";
import PopoverFloating from "../../../external/floating/pop-over/PopoverFloating";
import styles from "./UnderlineStandardSelect.module.css";
import withClassName from "../../../../utils/withClassName";
import { ChevronDownIcon } from "lucide-react";
import clsx from "clsx";

interface IUnderlineStandardSelectMulti<T extends string> {
    value: T | null,
    options: T[],
    onChange: (value: T | null) => void,
    placeholder?: string,
    disabled?: boolean,
    initialOpen?: boolean,
    mainColor: string,
    classNamePopoverFloating?: string,
    classNameTrigger?: string,
    classNameTriggerDisabled?: string,
    classNameTriggerInvalid?: string,
    classNameOption?: string,
    classNameOptionSelected?: string,
    withValidation?: boolean,
    placeholderClassName?: string,
    selectedLabelClassName?: string,
    maxHeight?: string,
    label: string,
}

const UnderlineStandardSelectMulti = <T extends string>({
    initialOpen = false,
    value,
    options,
    onChange,
    disabled = false,
    mainColor,
    classNamePopoverFloating,
    classNameTrigger,
    classNameTriggerDisabled,
    classNameTriggerInvalid,
    classNameOption,
    classNameOptionSelected,
    withValidation = false,
    selectedLabelClassName,
    maxHeight,
    label
}: IUnderlineStandardSelectMulti<T>) => {

    const [open, setOpen] = useState<boolean>(initialOpen);
    const [listOptions, setListOptions] = useState<T[]>(options);

    const toggleOpen = useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

    const selectedLabel: string | null = useMemo(() => {
        return value ? String(value) : null;
    }, [value]);

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
            disabled={disabled}
            setOpen={setOpen}
            {...(maxHeight && { maxHeight })}
            childrenTrigger={
                <SelectTriggerMemo
                    selectedLabel={selectedLabel}
                    toggleOpen={toggleOpen}
                    mainColor={mainColor}
                    classNameTrigger={classNameTrigger}
                    classNameTriggerInvalid={classNameTriggerInvalid}
                    classNameTriggerDisabled={classNameTriggerDisabled}
                    selectedLabelClassName={selectedLabelClassName}
                    withValidation={withValidation}
                    disabled={disabled}
                    label={label}
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

const UnderlineStandardSelectMultiMemo = memo(UnderlineStandardSelectMulti) as typeof UnderlineStandardSelectMulti;

export default UnderlineStandardSelectMultiMemo;


// * ************ SELECT TRIGGER ************ 

interface ISelectTrigger {
    selectedLabel: string | null,
    toggleOpen: () => void
    mainColor: string;
    classNameTrigger?: string;
    classNameTriggerInvalid?: string;
    classNameTriggerDisabled?: string;
    selectedLabelClassName?: string;
    withValidation?: boolean;
    disabled?: boolean;
    placeholder?: string;
    label?: string;
}

const SelectTrigger = ({
    selectedLabel,
    toggleOpen,
    mainColor,
    classNameTrigger,
    classNameTriggerInvalid,
    classNameTriggerDisabled,
    selectedLabelClassName,
    withValidation,
    disabled = false,
    label = "Hola",
}: ISelectTrigger) => {

    const [focused, setFocused] = useState(false);

    const iconWithClass = useMemo(
        () => withClassName(
            <ChevronDownIcon />,
            styles.icon,
            {
                color: (!disabled && selectedLabel) ? mainColor : "var(--color-alert)"
            }),
        [mainColor, selectedLabel]);

    const handleOnClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        toggleOpen();
    }, [toggleOpen]);

    const [classNameTri, classNameLabelValid, classNameLabel] = useMemo(() => {
        const classNameTri = clsx(
            `${styles.fieldSelectContainer} ${classNameTrigger}`,
            disabled ? classNameTriggerDisabled : "",
            (!disabled && withValidation) ? (
                (!selectedLabel)
                    ? `${styles.invalidValue} ${classNameTriggerInvalid}`
                    : ""
            ) : "",
        );
        const classNameLabelValid = clsx(
            "nunito-regular",
            selectedLabelClassName
        );
        const classNameLabel = clsx(
            "nunito-regular",
            styles.label,
            (focused && selectedLabel) && styles.floating,
        );

        return [classNameTri, classNameLabelValid, classNameLabel];
    }, [
        selectedLabel, disabled, withValidation, classNameTriggerInvalid,
        classNameTrigger, classNameTriggerDisabled, selectedLabelClassName, focused
    ]);

    return (
        <div
            onClick={handleOnClick}
            tabIndex={disabled ? -1 : 0}
            className={classNameTri}
            onFocus={() => setFocused(true)}
        >
            {selectedLabel && <span className={classNameLabelValid}> {selectedLabel} </span>}
            {iconWithClass}
            <label className={classNameLabel}>
                {label}
            </label>
        </div>
    )
}

const SelectTriggerMemo = memo(SelectTrigger) as typeof SelectTrigger;

// * ************ FloatingComponent ************ */

interface IFloatingComponent<T extends string> {
    listOptions: T[];
    value: T | null;
    toggleOpen: () => void;
    onChange: (value: T | null) => void;
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
                        if (isSelected) onChange(null);
                        else onChange(option);
                        toggleOpen();
                    }, [value, option, toggleOpen, isSelected]);

                    const handleOnKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            if (isSelected) onChange(null);
                            else onChange(option);
                            toggleOpen();
                        }
                    }, [value, option, toggleOpen, isSelected]);

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

