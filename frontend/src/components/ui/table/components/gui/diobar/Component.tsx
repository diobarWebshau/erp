import { useEffect, useState } from "react";
import SelectSearchMultipleCheck from "./SelectSearchMultiCheck";

interface Object2 {
    id: number;
    name: string;
    age: number;
}

const listOriginal: Object2[] = [
    {
        id: 1,
        name: "Diobar",
        age: 32
    },
    {
        id: 2,
        name: "Diego",
        age: 32
    },
    {
        id: 3,
        name: "Divany",
        age: 32
    },
    {
        id: 4,
        name: "Alisson",
        age: 32
    },
    {
        id: 5,
        name: "David",
        age: 32
    }
]

// Hook personalizado que simula carga de datos
function useLoadList(str: string): { list: Object2[]; loading: boolean } {
    const [list, setList] = useState<Object2[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => {
            setList(
                str.trim() === ""
                    ? []
                    : listOriginal.filter((item) =>
                        item.name.toLowerCase().startsWith(str.toLowerCase())
                    )
            );
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timeout);
    }, [str]);

    return { list, loading };
}

const Component = () => {

    const [selected, setSelected] = useState<Object2[]>([]);
    const [search, setSearch] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    const { list, loading } = useLoadList(search);

    // Abrir dropdown al escribir
    const onChangeSearch = (newSearch: string) => {
        setSearch(newSearch);
        setOpen(true);
    };

    return (
        <div>

            <SelectSearchMultipleCheck<Object2>
                list={list}
                rowId="name"
                selected={selected}
                setSelected={setSelected}
                search={search}
                setSearch={onChangeSearch}
                open={open}
                setOpen={setOpen}
                isLoading={loading}
                emptyMessage="No hay resultados"
            />
            {/* <div>
                <pre>{JSON.stringify(selected, null, 2)}</pre>
            </div> */}
        </div>
    );
}

export default Component;
