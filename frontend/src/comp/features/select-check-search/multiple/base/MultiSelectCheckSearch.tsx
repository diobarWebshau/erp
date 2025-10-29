import { memo, useEffect, useState } from "react";
import PopoverFloating from "../../../../external/floating/pop-over/PopoverFloating"
import InputTextCustom from "./../../../../../comp/primitives/input/text/custom/InputTextCustom";
import { Search } from "lucide-react";

interface MultiSelectCheckSearchProps<T> {

    // props para el manejo del popover
    open: boolean;
    setOpen: (open: boolean) => void;
    initialOpen?: boolean;

    // props de retroalimentacion
    placeholder?: string;
    emptyMessage?: string;

    // props para la fuente de datos(Solo se puede habilitar una a la vez)
    options?: T[]
    loadOptions?: (inputValue: string) => Promise<T[]>;
    rowId: keyof T;

    // props para el estado de seleccion
    selected: T[];
    setSelected: (selected: T[]) => void;

}

const MultiSelectCheckSearch = <T,>({
    open, setOpen,
    initialOpen,
    placeholder, emptyMessage,
    options,
    loadOptions,
    rowId,
    selected, setSelected
}: MultiSelectCheckSearchProps<T>) => {

    // variable para el manejo del search
    const [search, setSearch] = useState<string>("");
    // variable para la lista de datos
    const [list, setList] = useState<T[]>([]);
    // variable para el manejo del loading
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Efecto para cargar los datos(async o local) 
    useEffect(() => {
        if (!open) {
            setList([]);
            return;
        }
        if (loadOptions) {
            setIsLoading(true);
            loadOptions(search)
                .then((res) => setList(res ?? []))
                .catch(() => setList([]))
                .finally(() => setIsLoading(false));
        } else if (options) {
            setIsLoading(false);
            let filtered = options;
            if (search.trim() !== "") {
                filtered = options.filter((item) => {
                    const val = String(item[rowId] ?? "").toLowerCase();
                    return val.includes(search.toLowerCase());
                });
            }
            setList(filtered);
        }
    }, [search, loadOptions, options]);

    return <PopoverFloating
        open={open}
        initialOpen={initialOpen}
        setOpen={setOpen}
        childrenTrigger={
            <InputDiv
                value={search}
                onChange={setSearch}
                placeholder={placeholder}
            />
        }
        childrenFloating={<div>holasdsda</div>}
    />
}

const MultiSelectCheckSearchMemo = memo(MultiSelectCheckSearch) as typeof MultiSelectCheckSearch;

export default MultiSelectCheckSearchMemo;

interface InputDivProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const InputDiv = ({
    placeholder,
    value,
    onChange
}: InputDivProps) => {
    return <div>
        <InputTextCustom
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            icon={<Search />}
        />
    </div>
}
