import { useEffect, useState } from "react";

interface UseDebounceInputs {
    value: string | number;
    delay: number;
}

const useDebounceBasic = ({ value, delay }: UseDebounceInputs): string | number => {
    // estado para el valor debounced
    const [debouncedValue, setDebouncedValue] = useState(value);
    // useEffect para manejar el delay cada vez que el valor cambia
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        // Este se ejectua cada vez que el valor cambia y cuando el componente se desmonta
        // limpiar el timeout si el valor cambia antes de que el delay termine
        return () => clearTimeout(handler); // esto se hace para evitar que el timeout se ejecute si el valor cambia antes de que el delay termine(en otro sentido)
    }, [value, delay]);
    // retorno el valor debounced
    return debouncedValue;
}

export default useDebounceBasic;
