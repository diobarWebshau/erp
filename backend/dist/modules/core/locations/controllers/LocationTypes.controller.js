import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import { LocationTypeModel, LocationLocationTypeModel } from "../../associations.js";
import { Op } from "sequelize";
class LocationTypeController {
    static getAll = async (req, res, next) => {
        try {
            const response = await LocationTypeModel.findAll();
            if (!(response.length > 0)) {
                res.status(404).json([]);
                return;
            }
            const locationTypes = response.map(l => l.toJSON());
            res.status(200).json(locationTypes);
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
    static getById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await LocationTypeModel.findByPk(id);
            if (!response) {
                res.status(404).json({
                    validation: "Location type no found"
                });
                return;
            }
            const locationType = response.toJSON();
            res.status(200).json(locationType);
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
    static getByName = async (req, res, next) => {
        const { name } = req.params;
        try {
            const response = await LocationTypeModel.findOne({
                where: { name: name }
            });
            if (!response) {
                res.status(404).json({ validation: "Location type no found" });
                return;
            }
            const locationType = response.toJSON();
            res.status(200).json(locationType);
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
        const { name } = req.body;
        try {
            const validateName = await LocationTypeModel.findOne({
                where: { name: name }
            });
            if (validateName) {
                res.status(409).json({
                    validation: "The name is already currently in use by a locationType"
                });
                return;
            }
            const response = await LocationTypeModel.create({
                name,
            });
            if (!response) {
                res.status(400).json({
                    validation: "The locationType could not be created"
                });
                return;
            }
            res.status(201).json({
                message: "LocationType created successfully"
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
    static update = async (req, res, next) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const editableFields = LocationTypeModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation: "There are no validated location "
                        + "type properties for the update."
                });
                return;
            }
            const validatedLocationType = await LocationTypeModel.findByPk(id);
            if (!validatedLocationType) {
                res.status(404).json({ validation: "LocationType not found" });
                return;
            }
            if (update_values?.name) {
                const validateName = await LocationTypeModel.findOne({
                    where: {
                        [Op.and]: [
                            { name: update_values.name },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });
                if (validateName) {
                    res.status(409).json({
                        validation: "The name is already currently in use by a locationType"
                    });
                    return;
                }
            }
            const response = await LocationTypeModel.update(update_values, {
                where: { id: id },
                individualHooks: true
            });
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No changes were made to the locationType"
                });
                return;
            }
            res.status(200).json({ message: "LocationType updated succefally" });
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
    static delete = async (req, res, next) => {
        const { id } = req.params;
        try {
            const validationLocationTypes = await LocationLocationTypeModel.findAll({
                where: {
                    location_type_id: id
                }
            });
            if (validationLocationTypes.length > 0) {
                res.status(404).json({
                    validation: "This location type cannot be deleted because"
                        + " it is assigned to one or more locations."
                });
                return;
            }
            const response = await LocationTypeModel.destroy({
                where: { id: id },
                individualHooks: true
            });
            if (!(response > 0)) {
                res.status(404).json({
                    validation: "LocationType not found for deleted"
                });
                return;
            }
            res.status(201).json({
                message: "LocationType deleted successfully"
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
export default LocationTypeController;
