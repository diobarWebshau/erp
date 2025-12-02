import type { IItem, IPartialItem } from "interfaces/item";

const BASE_URL = import.meta.env.VITE_API_URL;
const relativePath = "production/items";
const API_URL = new URL(relativePath, BASE_URL);

interface IFetchItemsFromDB {
    like: string,
    conditionalExclude?: IPartialItem,
    signal: AbortSignal
}

interface IFetchItemsByIdFromDB {
    id: number;
    signal: AbortSignal;
}

const fetchItemsByIdFromDB = async ({
    id,
    signal
}: IFetchItemsByIdFromDB): Promise<IItem | null> => {
    const request = new Request(`${API_URL}/${id}`, {
        method: "GET",
        signal
    });
    const response = await fetch(request);
    if (!response.ok) {
        let errorBody: unknown = null;
        try {
            errorBody = await response.json();
        } catch {/**/}
        const message =
            typeof errorBody === "string"
                ? errorBody
                : (errorBody as any)?.message
                ?? `Request failed with status ${response.status}`;
        throw new Error(message);
    }
    const data: IItem = await response.json();
    return data;
}

const fetchItemsFromDB = async ({
    like,
    conditionalExclude,
    signal
}: IFetchItemsFromDB): Promise<IItem[]> => {

    const params = new URLSearchParams();
    if (like) params.set("filter", like);

    if (conditionalExclude && Object.keys(conditionalExclude).length > 0) {
        Object.entries(conditionalExclude).forEach(([key, value]) => {
            if (Array.isArray(value) || typeof value === "object") {
                params.set(key, JSON.stringify(value));
            } else {
                params.set(key, value.toString());
            }
        });
    };

    const request = new Request(`${API_URL}?${params.toString()}`, {
        method: "GET",
        signal
    });

    const response = await fetch(request);
    if (!response.ok) {
        let errorBody: unknown = null;
        try {
            errorBody = await response.json();
        } catch {
            // si no hay JSON, lo ignoramos
        }
        const message =
            typeof errorBody === "string"
                ? errorBody
                : (errorBody as any)?.message
                ?? `Request failed with status ${response.status}`;
        throw new Error(message);
    }
    const data: IItem[] = await response.json();
    return data;
}

export {
    fetchItemsFromDB,
    fetchItemsByIdFromDB
};