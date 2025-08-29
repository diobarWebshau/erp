// ParentComponent.tsx
import React, { useState } from "react";
import AsyncReactMultiSelect from "./AsyncReactMultiSelect";

type ColorOption = {
    id: string;
    name: string;
};

const mockOptions: ColorOption[] = [
    { id: "red", name: "Red" },
    { id: "blue", name: "Blue" },
    { id: "green", name: "Green" },
    { id: "yellow", name: "Yellow" },
    { id: "purple", name: "Purple" },
];

export default function ParentComponent() {
    const [selectedColors, setSelectedColors] = useState<readonly ColorOption[]>([]);

    const loadOptions = (inputValue: string): Promise<ColorOption[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const filtered = mockOptions.filter((option) =>
                    option.name.toLowerCase().includes(inputValue.toLowerCase())
                );
                resolve(filtered);
            }, 300);
        });
    };

    return (
        <div style={{ width: 400 }}>
            <h2>Selecciona colores</h2>
            <AsyncReactMultiSelect<ColorOption>
                value={selectedColors}
                onChange={setSelectedColors}
                loadOptions={loadOptions}
                getOptionLabel={(opt) => opt.name}
                getOptionValue={(opt) => opt.id}
            />
            <pre>{JSON.stringify(selectedColors, null, 2)}</pre>
        </div>
    );
}
