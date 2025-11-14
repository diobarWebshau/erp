import { memo, useCallback, useEffect, useMemo, useState } from "react";
import PopoverFloating from "../../../../comp/external/floating/pop-over/PopoverFloating";
import styles from "./UnderlineObjectSelectMulti.module.css";
import withClassName from "../../../../utils/withClassName";
import { ChevronDownIcon } from "lucide-react";
import clsx from "clsx";

interface IUnderlineObjectSelectMulti<T> {
    value: T[] | [];
    options: T[];
    labelKey: keyof T;
    onChange: (value: T[]) => void;
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

const UnderlineObjectSelectMulti = <T,>({
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
}: IUnderlineObjectSelectMulti<T>) => {

    const [open, setOpen] = useState<boolean>(initialOpen);
    const [listOptions, setListOptions] = useState<T[]>(options);

    const toggleOpen = useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

    const selectedLabel: string[] = useMemo(() => {
        return value ? value.map((item) => String(item[labelKey])) : [label];
    }, [value, labelKey, label]);

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
                    focused={open}
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

const UnderlineObjectSelectMultiMemo = memo(UnderlineObjectSelectMulti) as typeof UnderlineObjectSelectMulti;

export default UnderlineObjectSelectMultiMemo;


// * ************ SELECT TRIGGER ************ 

interface ISelectTrigger {
    selectedLabel: string[],
    toggleOpen: () => void
    mainColor: string;
    classNameTrigger?: string;
    classNameTriggerInvalid?: string;
    withValidation?: boolean;
    disabled?: boolean;
    classNameTriggerDisabled?: string;
    selectedLabelClassName?: string;
    focused?: boolean;
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
}: ISelectTrigger) => {

    const [focused, setFocused] = useState(false);


    const iconWithClass = useMemo(
        () => withClassName(
            <ChevronDownIcon />,
            styles.icon,
            {
                color: (!disabled && selectedLabel.length > 0) ? mainColor : "var(--color-alert)"
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
                (selectedLabel.length === 0)
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
            (focused && selectedLabel.length > 0 || selectedLabel.length > 0) && styles.floating,
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
            {
                selectedLabel.length > 0 && <span className={classNameLabelValid}> {selectedLabel.join(", ")} </span>
            }
            {iconWithClass}
            <label className={classNameLabel}>
                {label}
            </label>
        </div>
    )
}

const SelectTriggerMemo = memo(SelectTrigger) as typeof SelectTrigger;

// * ************ FloatingComponent ************ */

interface IFloatingComponent<T> {
    listOptions: T[];
    value: T[] | [];
    toggleOpen: () => void;
    labelKey: keyof T;
    onChange: (value: T[]) => void;
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
                listOptions.map((option, index) => {

                    const label = String(option[labelKey]);
                    const isSelected = (value as T[]).some((item) => String(item[labelKey]) === label);
                    const handleOnClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (isSelected) {
                            const newValue = value.filter(
                                (item) => String(item[labelKey]) !== String(option[labelKey])
                            );
                            onChange(newValue);
                        } else {
                            const newValue = [...value, option];
                            onChange(newValue);
                        }
                    }, [value, isSelected, option, labelKey, onChange]);

                    const handleOnKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            if (isSelected) {
                                const newValue = value.filter((item) => String(item[labelKey]) !== String(option[labelKey]));
                                onChange(newValue);
                            } else {
                                const newValue = [...value, option];
                                onChange(newValue);
                            }
                        }
                    }, [value, isSelected, option, toggleOpen]);

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

