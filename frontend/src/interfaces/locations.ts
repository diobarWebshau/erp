import type {
  ILocationType
} from "./locationTypes";

interface ILocation {
  id: number,
  name: string,
  description: string,
  types?: ILocationType[],
  is_active: boolean,
  created_at: string,
  updated_at: string
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
