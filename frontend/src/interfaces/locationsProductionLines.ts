import type {
    ILocation
} from "./locations";
import type {
    IPartialProductionLine,
} from "./productionLines";

interface ILocationProductionLine {
    id: number | string;
    location_id: number;
    production_line_id: number;
    location?: ILocation;
    production_line?: IPartialProductionLine;
}
type IPartialLocationProductionLine = Partial<ILocationProductionLine>;

interface LocationProductionLineManager {
    added: IPartialLocationProductionLine[],
    deleted: IPartialLocationProductionLine[],
    modified: IPartialLocationProductionLine[]
}


export type {
    ILocationProductionLine,
    IPartialLocationProductionLine,
    LocationProductionLineManager
};