import type { IPartialInput } from "./inputs";
import type { IPartialProduct } from "./product";

interface IItem {
    id: number,
    item_id: number,
    item_type: string
    item: IPartialProduct | IPartialInput
};

type IPartialItem = Partial<IItem>;

export type {
    IItem,
    IPartialItem
};