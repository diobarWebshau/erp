import type { ILocationProductionLine } from "./locationsProductionLines";
import type {
  ILocationType
} from "./locationTypes";

interface IInventoryRecord {
  stock: number;
  minimum_stock: number,
  maximum_stock: number,
  item_id: number;
  available: number;
  item_name: string;
  item_type: string;
  location_id: number;
  inventory_id: number;
  committed_qty: number;
  location_name: string;
  pending_production_qty: number;
}

interface ILocation {
  id: number,
  name: string,
  description: string,
  types?: ILocationType[],
  is_active: boolean,
  created_at: string,
  updated_at: string
  location_production_line?: ILocationProductionLine[]
  inventory?: IInventoryRecord
}

type IPartialLocation = Partial<ILocation>;

interface ILocationManager{
    added: IPartialLocation[],
    deleted: ILocation[],
    modified: IPartialLocation[],
}

const defaultValueLocation: ILocation = {
  id: 0,
  name: "",
  description: "",
  is_active: true,
  created_at: "",
  updated_at: "",
};

const defaultValuePartialLocation: Partial<ILocation> = {
  is_active: true,
  name: "",
  description: "",
};

export type {
  ILocation,
  IPartialLocation,
  ILocationManager
};

export {
  defaultValueLocation,
  defaultValuePartialLocation,
};
