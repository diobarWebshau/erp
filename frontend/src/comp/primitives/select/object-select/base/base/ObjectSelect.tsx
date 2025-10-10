import PopoverFloating from "../../../../../external/floating/pop-over/PopoverFloating";
import { memo, useMemo, useState, type JSX, type KeyboardEvent, type MouseEvent } from "react";
import styles from "./ObjectSelect.module.css";
import clsx from "clsx";
import withClassName from "../../../../../../utils/withClassName";
import { ChevronDown } from "lucide-react";

interface IObjectSelect<T> {
    defaultLabel: string,
    labelKey: keyof T;             // key para mostrar en el label
    isInitialOpen?: boolean,
    options: T[],
    icon?: JSX.Element,
    value: T | null,
    maxHeight?: string,
    onChange: (value: T | null) => void,
}

const ObjectSelect = <T,>({
    defaultLabel = 'Seleccione una opción',
    isInitialOpen = false,
    options,
    labelKey,
    value,
    onChange,
    icon,
    maxHeight,
}: IObjectSelect<T>) => {

    const [isOpen, setIsOpen] = useState(isInitialOpen);

    const [selectedOption, setSelectedOption] = useState<string | null>(value ? String(value[labelKey]) : defaultLabel);

    const iconWithClassNames = useMemo(() => withClassName((icon ? icon : <ChevronDown />), styles.iconButton), []);

    const [triggerClassNames] = (() => {
        const triggerClassNames = clsx(
            'nunito-regular',
            styles.fieldSelectContainer,
            selectedOption != defaultLabel && selectedOption != null
                ? styles.fieldSelectContainerValidate
                : styles.fieldSelectContainerInvalid,
        );

        return [triggerClassNames];
    })();

    return (
        <PopoverFloating
            matchWidth
            initialOpen={isInitialOpen}
            typeRole="select"
            placement="bottom"
            open={isOpen}
            setOpen={setIsOpen}
            maxHeight={"300px"}  
            childrenTrigger={
                <div className={triggerClassNames}
                >
                    {value ? String(value[labelKey]) : defaultLabel}
                    <button className={styles.iconButton}>
                        {iconWithClassNames}
                    </button>
                </div>
            }
            childrenFloating={
                <div className={styles.toggle}>
                    {
                        options.map((option, index) => (
                            <ObjectOption
                                key={index}
                                option={option}
                                value={value}
                                onChange={onChange}
                                setIsOpen={setIsOpen}
                                labelKey={labelKey}
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

interface IObjectOption<T> {
    option: T,
    labelKey: keyof T,
    value: T | null,
    onChange: (value: T | null) => void,
    setIsOpen: (value: boolean) => void,
}

const ObjectOption = <T,>({
    option,
    labelKey,
    value,
    onChange,
    setIsOpen
}: IObjectOption<T>) => {

    const optionLabel = String(option[labelKey]);
    const isSelected = value?.[labelKey] === option[labelKey];

    const optionClassNames = clsx(
        styles.option,
        isSelected
            ? styles.selected
            : styles.option,
    );

    const handleOnKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (["Enter", " "].includes(e.key)) {
            onChange?.(option);
            setIsOpen(false);
        }
    }

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        console.log("handleMouseDown");
        e.preventDefault();     // evita perder foco antes de onChange si lo necesitas
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className={optionClassNames}
            onMouseDown={handleMouseDown}
            onKeyDown={handleOnKeyDown}
        >
            {optionLabel}
        </div>
    )
}


