import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import {
    LocationsProductionLinesModel,
    LocationModel, ProductionLineModel
} from "../../../associations.js";
import {
    Request, Response, NextFunction
} from "express";
import { Op } from "sequelize";

class LocationsProductionLinesController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await
                LocationsProductionLinesModel.findAll();
            if (!(response.length > 0)) {
                res.status(404).json({
                    validation:
                        "Locations-production-lines relationships no found"
                });
                return;
            }
            const relationships = response.map(pi => pi.toJSON());
            res.status(200).json(relationships);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error ocurred ${error}`);
            }
        }
    }
    static getById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response = await
                LocationsProductionLinesModel.findByPk(id);
            if (!response) {
                res.status(200).json({
                    validation:
                        "Locations-production-lines relationship no found"
                });
                return;
            }
            const relationship = response.toJSON();
            res.status(200).json(relationship);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error ocurred ${error}`);
            }
        }
    }
    static create = async (req: Request, res: Response, next: NextFunction) => {
        const { production_line_id, location_id } = req.body;
        try {

            const [validateProductionLine, validatelocation] =
                await Promise.all([
                    ProductionLineModel.findByPk(production_line_id),
                    LocationModel.findByPk(location_id)
                ]);

            if (!validateProductionLine) {
                res.status(404).json({
                    validation:
                        "The assigned producttion line does not exist"
                });
                return;
            }
            if (!validatelocation) {
                res.status(404).json({
                    validation:
                        "The assigned location does not exist"
                });
                return;
            }
            const validation =
                await LocationsProductionLinesModel.findOne({
                    where: {
                        [Op.and]: [
                            { production_line_id: production_line_id },
                            { location_id: location_id }
                        ]
                    }
                });
            if (validation) {
                res.status(409).json({
                    validation:
                        "Locations-production-lines relationship"
                        + " already exists"
                });
                return;
            }
            const response =
                await LocationsProductionLinesModel.create({
                    production_line_id,
                    location_id
                });
            if (!response) {
                res.status(400).json({
                    validation:
                        "The location-production-line relationship "
                        + "could not be created"
                });
                return;
            }
            res.status(200).json({
                message:
                    "Locations-production-lines relationship"
                    + " created successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(
                    `An unexpected error ocurred ${error}`);
            }
        }
    }
    static update = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const validateRelationship =
                await LocationsProductionLinesModel.findByPk(id);
            if (!validateRelationship) {
                res.status(404).json({
                    validation:
                        "Locations-production-lines relationship"
                        + " no found for update"
                });
                return;
            }
            const relationship =
                validateRelationship?.toJSON();
            const editableFields =
                LocationsProductionLinesModel.getEditableFields();
            const update_values =
                collectorUpdateFields(editableFields, body);

            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation:
                        "No validated properties were found for updating"
                        + "the production line assignment to the location"
                });
                return;
            }

            if (update_values?.production_line_id
                || update_values?.location_id) {
                const [validateLocation, validateProductionLine] =
                    await Promise.all([
                        update_values?.location_id
                            ? LocationModel.findByPk(
                                update_values?.location_id)
                            : null,
                        update_values?.production_line_id
                            ? ProductionLineModel.findByPk(
                                update_values?.production_line_id)
                            : null
                    ]);
                if (update_values?.production_line_id
                    && !validateProductionLine) {
                    res.status(200).json({
                        validation:
                            "The assigned production line does not exist"
                    });
                    return;
                }
                if (update_values?.location_id
                    && !validateLocation) {
                    res.status(200).json({
                        validation:
                            "The assigned location does not exist"
                    });
                    return;
                }
            }

            const validateProductionLineInSomeLocation =
                await LocationsProductionLinesModel.findOne({
                    where: {
                        production_line_id:
                            update_values?.production_line_id
                            || relationship?.production_line_id
                    },
                });

            if (validateProductionLineInSomeLocation) {
                res.status(409).json({
                    validate:
                        "The production line is already assigned "
                        + "to another location"
                })
                return;
            }

            const validateDuplicate =
                await LocationsProductionLinesModel.findOne({
                    where: {
                        [Op.and]: [
                            {
                                production_line_id:
                                    update_values?.production_line_id
                                    || relationship?.production_line_id
                            },
                            {
                                location_id:
                                    update_values?.location_id
                                    || relationship?.location_id
                            },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                })
            if (validateDuplicate) {
                res.status(409).json({
                    validate:
                        "Locations-production-lines relationship"
                        + " already exists"
                })
                return;
            }
            const response =
                await LocationsProductionLinesModel.update(
                    update_values,
                    { where: { id: id }, individualHooks: true }
                );
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation:
                        "No changes were made to the locations-"
                        + "production-lines relationship"
                })
                return;
            }
            res.status(200).json({
                message: "Locations-production-lines relationship"
                    + " updated succefally"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error ocurred ${error}`);
            }
        }
    }
    static deleteById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response =
                await LocationsProductionLinesModel.destroy({
                    where: { id: id }, individualHooks: true
                });
            if (!(response > 0)) {
                res.status(200).json({
                    validation:
                        "Location-production-lines relationship"
                        + " no found for delete"
                });
                return;
            }
            res.status(200).json({
                message:
                    "Locations-production-lines relationship"
                    + " deleted successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(
                    `An unexpected error ocurred ${error}`);
            }
        }
    }
}
export default LocationsProductionLinesController;