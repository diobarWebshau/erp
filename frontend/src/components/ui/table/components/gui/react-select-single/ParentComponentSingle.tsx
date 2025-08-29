import React, { useState } from "react";
import AsyncReactSingleSelect from "./AsyncSelectSingleSelect";

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

export default function ParentComponentSingle() {
    const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);

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
            <h2>Selecciona un color</h2>
            <AsyncReactSingleSelect<ColorOption>
                value={selectedColor}
                onChange={setSelectedColor}
                loadOptions={loadOptions}
                getOptionLabel={(opt) => opt.name}
                getOptionValue={(opt) => opt.id}
            />
            <pre>{JSON.stringify(selectedColor, null, 2)}</pre>
        </div>
    );
}
