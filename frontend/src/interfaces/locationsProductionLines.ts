import type {
    ILocation
} from "./locations";
import type {
    IPartialProductionLine,
} from "./productionLines";

interface ILocationProductionLine {
    id: number;
    location_id: number;
    production_line_id: number;
    location?: ILocation;
    production_line?: IPartialProductionLine;
}

type IPartialLocationProductionLine =
    Partial<ILocationProductionLine>;

export type {
    ILocationProductionLine,
    IPartialLocationProductionLine,
};