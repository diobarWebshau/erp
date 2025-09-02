import { useState, useEffect } from "react";

function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

// type StringKeys<T> = {
//     [K in keyof T]: T[K] extends string ? K : never;
// }[keyof T];

// Solo exactamente string (permitiendo opcional/null con NonNullable)
type StrictStringKeys<T> = {
    [K in keyof T]-?: NonNullable<T[K]> extends string ? K : never
}[keyof T];


export {
    useDebounce,
    type StrictStringKeys
}


