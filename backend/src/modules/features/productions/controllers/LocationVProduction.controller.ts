import LocationsControllers
    from "./../../../core/locations/controllers/index.js"
import {
    LocationModel, LocationTypeModel,
    LocationLocationTypeModel,
    LocationsProductionLinesModel,
    ProductionLineModel
} from "../../../associations.js"
import {
    Request, NextFunction, Response
} from "express";
import { Op } from "sequelize";

class LocationVProductionController
    extends LocationsControllers.LocationController {
    static getTypesOfLocation = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const validateLocation = await LocationModel.findOne({ where: { id: id } });
            if (!validateLocation) {
                res.status(200).json({ validation: "Location no found" });
                return;
            }
            const response = await LocationModel.findAll({
                where: { id: id },
                attributes: LocationModel.getAllFields(),
                include: [{
                    model: LocationLocationTypeModel,
                    as: "location_location_type",
                    attributes: LocationLocationTypeModel.getAllFields(),
                    include: [{
                        model: LocationTypeModel,
                        as: "location_type",
                        attributes: LocationTypeModel.getAllFields(),
                    }]
                }]
            });
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Types no found for this location" });
                return;
            }
            const types = response.map(t => t.toJSON());
            res.status(200).json(types);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static getProductionLines = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        try {
            const validateLocation = await LocationModel.findOne({ where: { id: id } });
            if (!validateLocation) {
                res.status(200).json({ validation: "Location no found" });
                return;
            }
            const response = await LocationModel.findAll({
                attributes: LocationModel.getAllFields(),
                where: { id: id },
                include: [{
                    model: LocationsProductionLinesModel,
                    as: "location_production_line",
                    attributes: LocationsProductionLinesModel.getAllFields(),
                    where: { location_id: id },
                    include: [{
                        model: ProductionLineModel,
                        as: "production_line",
                        attributes: ProductionLineModel.getAllFields()
                    }],
                }]
            });
            if (!(response.length > 0)) {
                res.status(202).json({
                    validation: "Production lines not found for this location."
                });
                return;
            }
            const production_lines = response.map(i => i.toJSON());
            res.status(200).json(production_lines);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static addProductionLine = async (req: Request, res: Response, next: NextFunction) => {
        const { id, production_line_id } = req.params;
        try {
            const validateLocation = await LocationModel.findOne({ where: { id: id } });
            if (!validateLocation) {
                res.status(200).json({ validation: "Location not found" });
                return;
            }
            const validateProductionLine = await ProductionLineModel.findOne({
                where: { id: production_line_id }
            });
            if (!validateProductionLine) {
                res.status(200).json({
                    validation:
                        "The assigned production line does not exist"
                });
                return;
            }
            const validateLocationsLocationTypes = await LocationModel.findOne({
                attributes: LocationModel.getAllFields(),
                where: { id: id },
                include: [{
                    model: LocationLocationTypeModel,
                    as: "location_location_type",
                    attributes: [],
                    where: { location_id: id },
                    include: [{
                        model: LocationTypeModel,
                        as: "location_type",
                        attributes: [],
                        where: { name: "Production" },
                    }],
                }]
            });

            if (!validateLocationsLocationTypes) {
                res.status(200).json({
                    validation: "The location is not of type Production"
                });
                return;
            }

            const validationExistsProductionLineInSomeLocations =
                await LocationsProductionLinesModel.findOne({
                    where: { production_line_id: production_line_id, }
                });
            if (validationExistsProductionLineInSomeLocations) {
                res.status(200).json({
                    validation:
                        "The production line already has an assigned location"
                });
                return;
            }
            const response = await LocationsProductionLinesModel.create({
                location_id: Number(id),
                production_line_id: Number(production_line_id)
            });
            if (!response) {
                res.status(200).json({
                    validation: "The production line could not be added to the location"
                });
                return;
            }
            res.status(200).json({
                message:
                    "The production line has been assigned to the location"
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
    static removeProductionLine = async (req: Request, res: Response, next: NextFunction) => {
        const { id, production_line_id } = req.params;
        try {
            const validateLocation = await LocationModel.findOne({ where: { id: id } });
            if (!validateLocation) {
                res.status(200).json({ validation: "Location not found" });
                return;
            }
            const response = await LocationsProductionLinesModel.destroy({
                where: {
                    [Op.and]: [
                        { location_id: id },
                        { production_line_id: production_line_id }
                    ]
                },
                individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({
                    validation: "Production line not found in the location to be removed"
                });
                return;
            }
            res.status(200).json({ message: "Production line removed from location" });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error)
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
}

export default LocationVProductionController;