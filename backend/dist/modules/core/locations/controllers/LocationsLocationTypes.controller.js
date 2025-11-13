import { LocationModel, LocationLocationTypeModel, LocationTypeModel } from "../../associations.js";
import { Op } from "sequelize";
class LocationsLocationTypesController {
    static getAll = async (req, res, next) => {
        try {
            const response = await LocationLocationTypeModel.findAll();
            if (!(response.length > 0)) {
                res.status(404).json({
                    validation: "No type assigment have been assigned to any location"
                });
                return;
            }
            const relationships = response.map(pi => pi.toJSON());
            res.status(200).json(relationships);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
    static getTypesByLocationId = async (req, res, next) => {
        const { location_id } = req.query;
        try {
            const response = await LocationLocationTypeModel.findAll({
                where: { location_id: Number(location_id) },
                attributes: LocationLocationTypeModel.getAllFields()
            });
            if (!response) {
                res.status(404).json([]);
                return;
            }
            const relationship = response.map(u => u.toJSON());
            res.status(200).json(relationship);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
    static create = async (req, res, next) => {
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
                    validation: "The type has already been assigned to the location"
                });
                return;
            }
            const response = await LocationLocationTypeModel.create({
                location_type_id,
                location_id
            });
            if (!response) {
                res.status(400).json({
                    validation: "The type assigned to the location could not be created"
                });
                return;
            }
            res.status(201).json({
                message: "Type assigned to location created successfully"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
    static deleteById = async (req, res, next) => {
        const { location_id, location_type_id } = req.query;
        try {
            const response = await LocationLocationTypeModel.destroy({
                where: {
                    location_id: Number(location_id),
                    location_type_id: Number(location_type_id)
                },
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
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred ${error}`);
            }
        }
    };
}
export default LocationsLocationTypesController;
