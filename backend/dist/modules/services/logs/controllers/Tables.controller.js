import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import { TableModel } from "../associations.js";
import { Op } from "sequelize";
class TablesController {
    static getAll = async (req, res, next) => {
        try {
            const response = await TableModel.findAll();
            if (response.length < 1) {
                res.status(200).json({ validation: "Tables no found" });
                return;
            }
            const tables = response.map(u => u.toJSON());
            res.status(200).json(tables);
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
            const response = await TableModel.findByPk(id);
            if (!response) {
                res.status(200).json({ validation: "Table no found" });
                return;
            }
            const table = response.toJSON();
            res.status(200).json(table);
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
            const response = await TableModel.findOne({ where: { name: name } });
            if (!response) {
                res.status(200).json({ validation: "Table not found" });
                return;
            }
            const table = response.toJSON();
            res.status(200).json(table);
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
        const { name, table_name } = req.body;
        try {
            const validationName = await TableModel.findOne({
                where: { name: name }
            });
            if (validationName) {
                res.status(200).json({
                    validation: "The name is already used in a table"
                });
                return;
            }
            const validationTableName = await TableModel.findOne({
                where: { table_name: table_name }
            });
            if (validationTableName) {
                res.status(200).json({
                    validation: "The table name is already used in a table"
                });
                return;
            }
            const response = await TableModel.create({
                name: name, table_name: table_name
            });
            if (!response) {
                res.status(200).json({
                    validation: "The table could not be created"
                });
                return;
            }
            res.status(201).json({ message: "Table created successfully" });
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
            const validatedTable = await TableModel.findByPk(id);
            if (!validatedTable) {
                res.status(200).json({ validation: "Table not found" });
                return;
            }
            const editableFields = TableModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            if (!(Object.keys(update_values).length > 0)) {
                res.status(200).json({
                    validation: "There are no validated table properties for the update"
                });
                return;
            }
            if (update_values?.name) {
                const validateName = await TableModel.findOne({
                    where: {
                        [Op.and]: [
                            { name: update_values.name, },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });
                if (validateName) {
                    res.status(200).json({
                        validation: "The name is already used in a table"
                    });
                    return;
                }
            }
            if (update_values?.table_name) {
                const validateTableName = await TableModel.findOne({
                    where: {
                        [Op.and]: [
                            { name: update_values.table_name, },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });
                if (validateTableName) {
                    res.status(200).json({
                        validation: "The table name is already used in a table"
                    });
                    return;
                }
            }
            const response = await TableModel.update(update_values, { where: { id: id } });
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "No changes were made to the table"
                });
                return;
            }
            res.status(200).json({ message: "Table updated successfully" });
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
            const response = await TableModel.destroy({ where: { id: id } });
            if (response < 1) {
                res.status(200).json({
                    validation: "Table not found for deleted"
                });
                return;
            }
            res.status(200).json({ message: "Table deleted successfully" });
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
export default TablesController;
