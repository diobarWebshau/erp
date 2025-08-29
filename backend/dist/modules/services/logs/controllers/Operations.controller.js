import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import { OperationModel } from "../associations.js";
import { Op } from "sequelize";
class OperationController {
    static getAll = async (req, res, next) => {
        try {
            const response = await OperationModel.findAll();
            if (response.length < 1) {
                res.status(200).json({ validation: "Operations no found" });
                return;
            }
            const operations = response.map(u => u.toJSON());
            res.status(200).json(operations);
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
        const { id } = req.params;
        try {
            const response = await OperationModel.findByPk(id);
            if (!response) {
                res.status(200).json({ validation: "Operation no found" });
                return;
            }
            const operation = response.toJSON();
            res.status(200).json(operation);
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
            const response = await OperationModel.findOne({ where: { name: name } });
            if (!response) {
                res.status(200).json({ validation: "Operation not found" });
                return;
            }
            const operation = response.toJSON();
            res.status(200).json(operation);
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
            const validationName = await OperationModel.findOne({
                where: { name: name }
            });
            if (validationName) {
                res.status(200).json({
                    validation: "The name is already used in a Operation"
                });
                return;
            }
            const response = await OperationModel.create({ name: name });
            if (!response) {
                res.status(200).json({
                    validation: "The Operation could not be created"
                });
                return;
            }
            res.status(201).json({ message: "Operation created successfully" });
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
            const validatedOperation = await OperationModel.findByPk(id);
            if (!validatedOperation) {
                res.status(200).json({ validation: "Operation not found" });
                return;
            }
            const editableFields = OperationModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (!(Object.keys(update_values).length > 0)) {
                res.status(200).json({
                    validation: "There are no validated Operation properties for the update"
                });
                return;
            }
            const validateName = await OperationModel.findOne({
                where: {
                    [Op.and]: [
                        { name: update_values.name, },
                        { id: { [Op.ne]: id } }
                    ]
                }
            });
            if (validateName) {
                res.status(200).json({
                    validation: "The name is already used in a Operation"
                });
                return;
            }
            const response = await OperationModel.update(update_values, { where: { id: id } });
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No changes were made to the Operation"
                });
                return;
            }
            res.status(200).json({ message: "Operation updated successfully" });
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
            const response = await OperationModel.destroy({ where: { id: id } });
            if (response < 1) {
                res.status(200).json({ validation: "Operation not found for deleted" });
                return;
            }
            res.status(200).json({ message: "Operation deleted successfully" });
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
export default OperationController;
