import type {
    ILocation
} from "./locations";
import type {
    IProductionLine
} from "./productionLines";

interface ILocationProductionLine {
    id: number;
    location_id: number;
    production_line_id: number;
    location?: ILocation;
    production_line?: IProductionLine;
}

type IPartialLocationProductionLine =
    Partial<ILocationProductionLine>;

const defaultValueLocationProductionLine:
    ILocationProductionLine = {
    id: 0,
    location_id: 0,
    production_line_id: 0,
};

const defaultValuePartialLocationProductionLine:
    Partial<ILocationProductionLine> = {
    location_id: 0,
    production_line_id: 0,
};

export type {
    ILocationProductionLine,
    IPartialLocationProductionLine,
};

export {
    defaultValueLocationProductionLine,
    defaultValuePartialLocationProductionLine,
};
