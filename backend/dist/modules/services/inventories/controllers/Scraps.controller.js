import ScrapModel from "../models/references/Scrap.model.js";
import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
class ScrapController {
    static getAll = async (req, res, next) => {
        try {
            const response = await ScrapModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json([]);
                return;
            }
            const relationship = response.map(lp => lp.toJSON());
            res.status(200).json(relationship);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error `
                    + `ocurred ${error}`);
            }
        }
    };
    static getById = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await ScrapModel.findByPk(id);
            if (!response) {
                res.status(200).json(null);
                return;
            }
            const relationship = response.toJSON();
            res.status(200).json(relationship);
        }
        catch (error) {
            if (error instanceof Error) {
                next(error);
            }
            else {
                console.error(`An unexpected error ocurred`
                    + ` ${error}`);
            }
        }
    };
    static create = async (req, res, next) => {
        try {
            const { reference_type, reference_id, location_id, location_name, item_id, item_type, item_name, qty, reason, user_id, user_name } = req.body;
            const response = await ScrapModel.create({
                reference_type,
                reference_id,
                location_id,
                location_name,
                item_id,
                item_type,
                item_name,
                qty,
                reason,
                user_id,
                user_name
            });
            const relationship = response.toJSON();
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
    static update = async (req, res, next) => {
        const { id } = req.params;
        const completeBody = req.body;
        try {
            const editableFields = ScrapModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, completeBody);
            const responseValidateScrap = await ScrapModel.findByPk(id);
            if (!responseValidateScrap) {
                res.status(404).json({
                    validation: "Scrap does not exist"
                });
                return;
            }
            const scrap = responseValidateScrap.toJSON();
            if (!(Object.keys(update_values)?.length > 0)) {
                res.status(200).json({
                    validation: "No fields to update"
                });
                return;
            }
            await ScrapModel.update(update_values, {
                where: { id },
            });
            const updatedScrap = await ScrapModel.findByPk(id);
            const updatedScrapJson = updatedScrap?.toJSON();
            res.status(200).json(updatedScrapJson);
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
            const responseValidateScrap = await ScrapModel.findByPk(id);
            if (!responseValidateScrap) {
                res.status(404).json({
                    validation: "Scrap does not exist"
                });
                return;
            }
            await ScrapModel.destroy({
                where: { id },
            });
            res.status(200).json({
                validation: "Scrap successfully deleted"
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
export default ScrapController;
