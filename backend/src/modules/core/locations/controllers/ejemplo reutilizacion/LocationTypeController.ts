import collectorUpdateFields from "../../../../../scripts/collectorUpdateField.js";
import {
  LocationTypeModel,
  LocationLocationTypeModel
} from "../../associations.js";
import { Response, Request, NextFunction } from "express";
import { Op } from "sequelize";
import {
  getAllAsJson,
  getByPkAsJson,
  getOneAsJson,
  createItem,
  updateItem,
  deleteItem
} from "./dbHandlers.js";

class LocationTypeController {
  static getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getAllAsJson(res, LocationTypeModel, undefined, "LocationTypes not found");
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };

  static getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getByPkAsJson(res, LocationTypeModel, req.params.id, "LocationType not found");
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };

  static getByName = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await getOneAsJson(res, LocationTypeModel, { name: req.params.name }, "LocationType not found");
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };

  static create = async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;
    try {
      const exists = await LocationTypeModel.findOne({ where: { name } });
      if (exists) {
        res.status(409).json({
          validation: "The name is already currently in use by a locationType"
        });
        return;
      }

      await createItem(res, LocationTypeModel, { name }, "LocationType created successfully");
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };

  static update = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const body = req.body;

    try {
      const editableFields = LocationTypeModel.getEditableFields();
      const update_values = collectorUpdateFields(editableFields, body);

      if (Object.keys(update_values).length === 0) {
        res.status(400).json({
          validation: "There are no validated location type properties for the update."
        });
        return;
      }

      const existing = await LocationTypeModel.findByPk(id);
      if (!existing) {
        res.status(404).json({ validation: "LocationType not found" });
        return;
      }

      if (update_values?.name) {
        const nameExists = await LocationTypeModel.findOne({
          where: {
            [Op.and]: [
              { name: update_values.name },
              { id: { [Op.ne]: id } }
            ]
          }
        });
        if (nameExists) {
          res.status(409).json({
            validation: "The name is already currently in use by a locationType"
          });
          return;
        }
      }

      // Usa la función reusable aquí
      await updateItem(res, LocationTypeModel, id, update_values);
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };

  static delete = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
      const related = await LocationLocationTypeModel.findAll({
        where: { location_type_id: id }
      });

      if (related.length > 0) {
        res.status(404).json({
          validation: "This location type cannot be deleted because it is assigned to one or more locations."
        });
        return;
      }

      // Usa la función reusable aquí
      await deleteItem(res, LocationTypeModel, id);
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };
}

export default LocationTypeController;
