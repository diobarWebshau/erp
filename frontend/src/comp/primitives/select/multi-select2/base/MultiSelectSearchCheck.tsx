import { memo, useState } from "react";
import PopoverFloating from "../../../../external/floating/pop-over/PopoverFloating"
import InputTextCustom from "./../../../../../comp/primitives/input/text/custom/InputTextCustom";
import { Search } from "lucide-react";

interface MultiSelectSearchCheckProps<T> {

    // props para el manejo del popover
    open: boolean;
    setOpen: (open: boolean) => void;
    initialOpen?: boolean;

    // props de retroalimentacion
    placeholder?: string;
    emptyMessage?: string;

    // props para la fuente de datos(Solo se puede habilitar una a la vez)
    options: T[]

    // props para el estado de seleccion
    selected: T[];
    setSelected: (selected: T[]) => void;

}

const MultiSelectSearchCheck = <T,>({
    open, setOpen,
    initialOpen,
    placeholder, emptyMessage,
    options,
    selected, setSelected
}: MultiSelectSearchCheckProps<T>) => {

    return <PopoverFloating
        open={open}
        initialOpen={initialOpen}
        setOpen={setOpen}
        childrenTrigger={
            <InputDiv
                value={""}
                onChange={() => { }}
                placeholder={placeholder}
            />
        }
        childrenFloating={<div>holasdsda</div>}
    />
}

const MultiSelectSearchCheckMemo = memo(MultiSelectSearchCheck) as typeof MultiSelectSearchCheck;

export default MultiSelectSearchCheckMemo;

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
