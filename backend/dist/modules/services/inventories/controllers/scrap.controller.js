import ScrapModel from "../models/references/scrap.model.js";
import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
class ScrapController {
    static getAll = async (req, res, next) => {
        try {
            const response = await ScrapModel.findAll();
            if (!(response.length > 0)) {
                res.status(404).json([]);
                return;
            }
            const scrap = response.map(i => i.toJSON());
            res.status(200).json(scrap);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static getById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const response = await ScrapModel.findByPk(id);
            if (!response) {
                res.status(404).json([]);
                return;
            }
            const scrap = response.toJSON();
            res.status(200).json(scrap);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static create = async (req, res, next) => {
        const { reference_type, reference_id, location_id, location_name, item_id, item_type, item_name, qty } = req.body;
        try {
            const response = await ScrapModel.create({
                reference_type,
                reference_id,
                location_id,
                location_name,
                item_id,
                item_type,
                item_name,
                qty
            });
            if (!response) {
                res.status(404).json({
                    validation: "The scrap could not be created"
                });
                return;
            }
            res.status(201).json({
                message: "Scrap created successfully"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
    static update = async (req, res, next) => {
        const { id } = req.params;
        const body = req.body;
        try {
            const editableFields = ScrapModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (Object.keys(update_values).length === 0) {
                res.status(400).json({
                    validation: `There are no validated scrap`
                        + ` properties for the update.`
                });
                return;
            }
            const response = await ScrapModel.update(update_values, {
                where: { id }
            });
            if (!response[0]) {
                res.status(404).json({
                    validation: "The scrap could not be updated"
                });
                return;
            }
            res.status(200).json({
                message: "Scrap updated successfully"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`
                    An unexpected error occurred: ${error}`);
            }
        }
    };
    static delete = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await ScrapModel.destroy({
                where: { id: id },
                individualHooks: true
            });
            if (!(response > 0)) {
                res.status(404).json({
                    validation: "The scrap could not be deleted"
                });
                return;
            }
            res.status(200).json({
                message: "Scrap deleted successfully"
            });
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };
}
export default ScrapController;
