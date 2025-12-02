import PopoverFloating from "../../../../comp/external/floating/pop-over/PopoverFloating";
import { memo, useCallback, useEffect, useMemo, useState, type JSX } from "react";
import withClassName from "../../../../utils/withClassName";
import styles from "./UnderlineObjectSelect.module.css";
import { ChevronDownIcon } from "lucide-react";
import clsx from "clsx";

interface IUnderlineObjectSelectProp<T> {
    value: T | null;
    options: T[];
    labelKey: keyof T;
    onChange: (value: T | null) => void;
    label: string,
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
    selectedLabelClassName?: string;
    maxHeight?: string,
}

const UnderlineObjectSelect = <T,>({
    initialOpen = false,
    value,
    options,
    labelKey,
    onChange,
    label,
    disabled = false,
    mainColor,
    classNamePopoverFloating,
    classNameTrigger,
    classNameTriggerInvalid,
    classNameOption,
    classNameOptionSelected,
    withValidation = false,
    classNameTriggerDisabled,
    selectedLabelClassName,
    maxHeight,
}: IUnderlineObjectSelectProp<T>) => {

    const [open, setOpen] = useState<boolean>(initialOpen);
    const [listOptions, setListOptions] = useState<T[]>(options);

    const toggleOpen = useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

    const selectedLabel: string | null = useMemo(() => {
        return value ? String(value[labelKey]) : null;
    }, [value, labelKey]);

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
            {...(maxHeight && { maxHeight })}
            childrenTrigger={
                <SelectTriggerMemo
                    selectedLabel={selectedLabel}
                    disabled={disabled}
                    toggleOpen={toggleOpen}
                    mainColor={mainColor}
                    classNameTrigger={classNameTrigger}
                    classNameTriggerInvalid={classNameTriggerInvalid}
                    withValidation={withValidation}
                    classNameTriggerDisabled={classNameTriggerDisabled}
                    label={label}
                    selectedLabelClassName={selectedLabelClassName}
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

const UnderlineObjectSelectMemo = memo(UnderlineObjectSelect) as (<T, >(props: IUnderlineObjectSelectProp<T>) => JSX.Element);

export default UnderlineObjectSelectMemo;


// * ************ SELECT TRIGGER ************ 

interface ISelectTriggerProp {
    selectedLabel: string | null,
    toggleOpen: () => void
    mainColor: string;
    classNameTrigger?: string;
    classNameTriggerInvalid?: string;
    withValidation?: boolean;
    disabled?: boolean;
    classNameTriggerDisabled?: string;
    selectedLabelClassName?: string;
    label: string;
}

const SelectTrigger = ({
    selectedLabel,
    toggleOpen,
    mainColor,
    classNameTrigger,
    classNameTriggerInvalid,
    withValidation,
    disabled = false,
    classNameTriggerDisabled,
    selectedLabelClassName,
    label
}: ISelectTriggerProp) => {

    const [focused, setFocused] = useState(false);

    const iconWithClass = useMemo(
        () => withClassName(
            <ChevronDownIcon />,
            styles.icon,
            {
                color: (!disabled && selectedLabel) ? mainColor : "var(--color-alert)"
            }),
        [mainColor, selectedLabel, disabled]);

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
            (focused && selectedLabel || selectedLabel) && styles.floating,
        );

        return [classNameTri, classNameLabelValid, classNameLabel];
    }, [
        selectedLabel, disabled, withValidation, classNameTriggerInvalid,
        classNameTrigger, classNameTriggerDisabled, selectedLabelClassName, focused,
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

interface IFloatingComponentProp<T> {
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
}: IFloatingComponentProp<T>) => {

    return (
        <div
            className={styles.floatingComponent}
        >
            {listOptions.map((option: T, index: number) => {
                return (
                    <OptionComponentMemo
                        option={option}
                        index={index}
                        toggleOpen={toggleOpen}
                        labelKey={labelKey}
                        onChange={onChange}
                        value={value}
                        classNameOption={classNameOption}
                        classNameOptionSelected={classNameOptionSelected}
                    />
                )
            })}
        </div>
    )
}

const FloatingComponentMemo = memo(FloatingComponent) as (<T, >(props: IFloatingComponentProp<T>) => JSX.Element);

// ************ OptionComponent ************

interface IOptionComponentProp<T> {
    value: T | null,
    option: T,
    index: number,
    labelKey: keyof T,
    classNameOption?: string;
    classNameOptionSelected?: string;
    toggleOpen: () => void;
    onChange: (value: T | null) => void;
}

const OptionComponent = <T,>({
    option,
    labelKey,
    value,
    classNameOption,
    classNameOptionSelected,
    onChange,
    toggleOpen
}: IOptionComponentProp<T>) => {

    const isSelected = value?.[labelKey] === option[labelKey];

    const className = useMemo(
        () =>
            clsx(
                styles.option,
                isSelected ? `${styles.selected} ${classNameOptionSelected}` : "",
                classNameOption
            ),
        [isSelected, classNameOption, classNameOptionSelected]
    );

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        onChange(isSelected ? null : option);
        toggleOpen();
    }, [isSelected, onChange, option, toggleOpen]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            onChange(isSelected ? null : option);
            toggleOpen();
        }
    }, [isSelected, onChange, option, toggleOpen]);

    return (
        <div
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={className}
        >
            {String(option[labelKey])}
        </div>
    );
};


const OptionComponentMemo = memo(OptionComponent) as (<T, >(props: IOptionComponentProp<T>) => JSX.Element);
