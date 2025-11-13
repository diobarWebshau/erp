import type { ILocationLocationType } from "./locationLocationType";
import type { ILocationProductionLine } from "./locationsProductionLines";
import type { ILocationType } from "./locationTypes";

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
  // info
  id: number,
  custom_id: string,
  name: string,
  description: string,
  location_manager: string,

  // address
  street: string,
  street_number: number,
  neighborhood: string,
  zip_code: number,
  city: string,
  state: string,
  country: string,

  // contact
  phone: string,

  // state
  is_active: boolean,
  created_at: string,
  updated_at: string,

  // relations
  types?: ILocationType[],
  location_production_line?: ILocationProductionLine[]
  location_location_type: ILocationLocationType[]
  inventory?: IInventoryRecord
}

type IPartialLocation = Partial<ILocation>;

interface ILocationManager {
  added: IPartialLocation[],
  deleted: ILocation[],
  modified: IPartialLocation[],
}

export type {
  ILocation,
  IPartialLocation,
  ILocationManager
};
