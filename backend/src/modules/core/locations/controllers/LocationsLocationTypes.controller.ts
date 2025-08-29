import { LocationModel, LocationLocationTypeModel, LocationTypeModel }
    from "../../associations.js";
import collectorUpdateFields
    from "../../../../scripts/collectorUpdateField.js";
import { Request, Response, NextFunction }
    from "express";
import { Op }
    from "sequelize";

class LocationsLocationTypesController {
    static getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await LocationLocationTypeModel.findAll();
            if (!(response.length > 0)) {
                res.status(404).json({
                    validation:
                        "No type assigment have been assigned to any location"
                });
                return;
            }
            const relationships = response.map(pi => pi.toJSON());
            res.status(200).json(relationships);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static getById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response =
                await LocationLocationTypeModel.findOne({ where: { id: id } });
            if (!response) {
                res.status(404).json({
                    validation: "No types assigment have been assigned to location"
                });
                return;
            }
            const relationship = response.toJSON();
            res.status(200).json(relationship);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static getTypesByLocationId = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response =
                await LocationLocationTypeModel.findAll({ where: { location_id: id } });
            if (!response) {
                res.status(404).json([]);
                return;
            }
            const relationship = response.map(u => u.toJSON());
            res.status(200).json(relationship);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static create = async (req: Request, res: Response, next: NextFunction) => {
        const { location_type_id, location_id } = req.body;
        try {
            const [validateLocationType, validatelocation] = await Promise.all([
                LocationTypeModel.findByPk(location_type_id),
                LocationModel.findByPk(location_id)
            ]);
            if (!validateLocationType) {
                res.status(404).json({
                    validation: "The assigned location type does not exist"
                });
                return;
            }
            if (!validatelocation) {
                res.status(404).json({
                    validation: "The assigned location does not exist"
                });
                return;
            }
            const validation = await LocationLocationTypeModel.findOne({
                where: {
                    [Op.and]: [
                        { location_type_id: location_type_id },
                        { location_id: location_id }
                    ]
                }
            });
            if (validation) {
                res.status(409).json({
                    validation:
                        "The type has already been assigned to the location"
                });
                return;
            }
            const response = await LocationLocationTypeModel.create({
                location_type_id,
                location_id
            });
            if (!response) {
                res.status(400).json({
                    validation:
                        "The type assigned to the location could not be created"
                });
                return;
            }

            res.status(201).json({
                message: "Type assigned to location created successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static update = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const validateRelationship =
                await LocationLocationTypeModel.findByPk(id);
            if (!validateRelationship) {
                res.status(200).json({
                    validation:
                        "The type assigment to the location does not exist"
                });
                return;
            }
            const relationship = validateRelationship.toJSON();
            const editableFields = LocationLocationTypeModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation:
                        "No validated properties were found for updating" +
                        "the type assignment to the location"
                });
                return;
            }

            if (update_values?.location_id || update_values?.location_type_id) {
                const [location, locationType] = await Promise.all([
                    update_values.location_id ?
                        LocationModel.findByPk(update_values?.location_id) : null,
                    update_values.location_type_id ?
                        LocationTypeModel.findByPk(update_values?.location_type_id) : null
                ]);

                if (update_values?.location_id && !location) {
                    res.status(404).json({
                        validation: "The assigned location does not exist"
                    });
                    return;
                }

                if (update_values?.location_type_id && !locationType) {
                    res.status(404).json({
                        validation: "The assigned location type does not exist"
                    });
                    return;
                }
            }

            const validateDuplicate = await LocationLocationTypeModel.findOne({
                where: {
                    [Op.and]: [
                        {
                            location_id: update_values.location_id
                                || relationship.location_id
                        },
                        {
                            location_type_id: update_values.location_type_id
                                || relationship.location_type_id
                        },
                        { id: { [Op.ne]: id } }
                    ]
                }
            });

            if (validateDuplicate) {
                res.status(409).json({
                    validation: "The assigned type to location already exists"
                });
                return;
            }


            const response = await LocationLocationTypeModel.update(
                update_values,
                {
                    where: { id: id },
                    individualHooks: true
                }
            );
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation:
                        "No changes were made to the type assignment to the location"
                })
                return;
            }
            res.status(200).json({
                message: "Type assignment to location updated successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
    static deleteById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const response =
                await LocationLocationTypeModel.destroy({
                    where: { id: id },
                    individualHooks: true
                });
            if (!(response > 0)) {
                res.status(200).json({
                    validation: "Type assignment to location no found for delete"
                });
                return;
            }
            res.status(200).json({
                message: "Type assignment to location deleted successfully"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    }
}
export default LocationsLocationTypesController;