import type { JSX } from "react";
import stylesModules from "./ToggleRadioButtonGroup.module.css";
import withClassName from "../../../../utils/withClassName";

interface Option {
    label: string;
    icon: JSX.Element;
}

interface ToggleRadioButtonGroupProps {
    options: [Option, Option];
    columnId: string;
    onChange: (optionSelectedLabel: string, columnId: string) => void;
    isOptionSelectedFunction: (optionLabel: string, columnId: string) => boolean;
    typeOrderIcon: "first" | "last";
    classNameContainer?: string;
    classNameButton?: string;
    classNameSelected?: string;
    classNameIcon?: string;
    classNameLabel?: string;
}

const ToggleRadioButtonGroup = ({
    options,
    columnId,
    onChange,
    isOptionSelectedFunction,
    typeOrderIcon,
    classNameContainer = "",
    classNameButton = "",
    classNameSelected = "",
    classNameIcon = "",
    classNameLabel = "",
}: ToggleRadioButtonGroupProps) => {
    return (
        <div className={`${stylesModules.container} ${classNameContainer}`}>
            {options.map(({ label, icon }) => {
                const isSelected: boolean = isOptionSelectedFunction(label, columnId);
                const iconWithClassName = withClassName(icon, stylesModules.icon);
                return (
                    <button
                        key={label}
                        type="button"
                        onClick={() => onChange(label, columnId)}
                        className={`${stylesModules.button} ${classNameButton} ${isSelected ? `${stylesModules.selected} ${classNameSelected}` : ""
                            }`}
                    >
                        {typeOrderIcon === "first" && (
                            <span className={classNameIcon}>{iconWithClassName}</span>
                        )}
                        <span className={`nunito-semibold ${stylesModules.label} ${classNameLabel}`}>{label}</span>
                        {typeOrderIcon === "last" && (
                            <span className={classNameIcon}>{iconWithClassName}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export type { Option };
export default ToggleRadioButtonGroup;


/* UN EJEMPLO DEL USO */
/*

import { useState } from "react";
import ToggleRadioButtonGroup, { type Option } from "../../../comp/primitives/radio-button/custon-radio-button/ToggleRadioButtonGroup";
import { ArrowUp, ArrowDown } from "lucide-react";

const options = [
    { label: "Arriba", icon: <ArrowUp /> },
    { label: "Abajo", icon: <ArrowDown /> },
] as [Option, Option];

type Value = {
    desc: true | false;
    id: string;
};

type SortingState = Value[];

const NotFound = () => {
    const [sortingState, setSortingState] = useState<SortingState>([
        {
            desc: true,
            id: "name",
        },
    ]);

    const ASC = options[0].label; // "Arriba"
    const DESC = options[1].label; // "Abajo"

    const onChange = (label: string, columnId: string) => {
        const valueBoolean = label === DESC; // true => descendente
        const found = sortingState.find((c) => c.id === columnId)?.desc;

        if (found === undefined) {
            setSortingState([{ id: columnId, desc: valueBoolean }]);
        } else if (found === valueBoolean) {
            setSortingState(sortingState.filter((c) => c.id !== columnId)); // quitar orden
        } else {
            setSortingState([{ id: columnId, desc: valueBoolean }]);
        }
    };

    const isSelected = (optionLabel: string, columnId: string): boolean => {
        console.log(sortingState);
        const desc = sortingState.find((c) => c.id === columnId)?.desc;
        if (desc === undefined) return false;
        return desc ? optionLabel === DESC : optionLabel === ASC;
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "600px",
                height: "auto",
                backgroundColor: "rgba(240, 255, 174, 0.712)",
                padding: "5rem",
                gap: "1rem",
            }}
        >
            <h1>Not found</h1>
            <ToggleRadioButtonGroup
                options={options}
                columnId="name"
                typeOrderIcon="first"
                onChange={onChange}
                isOptionSelectedFunction={isSelected}
            />
        </div>
    );
};

export default NotFound;

*/
