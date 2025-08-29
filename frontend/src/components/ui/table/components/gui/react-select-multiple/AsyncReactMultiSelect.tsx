import React from "react";
import AsyncSelect from "react-select/async";
import { components } from "react-select";
import { Search } from "lucide-react";

type BaseProps<T> = {
    value: T[]; // sin readonly
    onChange: (options: T[]) => void; // sin readonly
    loadOptions: (inputValue: string) => Promise<T[]>;
    getOptionLabel: (option: T) => string;
    getOptionValue: (option: T) => string;
    placeholder?: string;
    className?: string;
    noOptionsMessage?: string;
};

const CustomDropdownIndicator = (props: any) => {
    const innerProps = {
        ...props.innerProps,
        onMouseDown: (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
        },
    };

    return (
        <components.DropdownIndicator {...props} innerProps={innerProps}>
            <Search size={18} />
        </components.DropdownIndicator>
    );
};

export default function AsyncReactMultiSelect<T>({
    value,
    onChange,
    loadOptions,
    getOptionLabel,
    getOptionValue,
    placeholder = "Selecciona opciones...",
    className,
    noOptionsMessage = "No hay resultados",
}: BaseProps<T>) {
    return (
        <AsyncSelect<T, true>
            openMenuOnFocus={false}
            openMenuOnClick={false}
            closeMenuOnSelect={false}
            cacheOptions
            defaultOptions
            isMulti
            value={value}
            onChange={(options) => onChange(options ? [...options] : [])}
            loadOptions={loadOptions}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            placeholder={placeholder}
            components={{ DropdownIndicator: CustomDropdownIndicator }}
            styles={{
                control: (base) => ({
                    ...base,
                    borderColor: "#007bff",
                    boxShadow: "0 0 0 1px #007bff",
                    "&:hover": { borderColor: "#0056b3" },
                }),
                multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#cce5ff",
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    color: "#004085",
                }),
                dropdownIndicator: (base) => ({
                    ...base,
                    color: "#007bff",
                    padding: "0 8px",
                    cursor: "pointer",
                    transition: "color 0.2s",
                    ":hover": { color: "#0056b3" },
                }),
            }}
            className={className}
            noOptionsMessage={() => noOptionsMessage}
        />
    );
}
