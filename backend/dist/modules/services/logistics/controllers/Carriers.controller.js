import collectorUpdateFields from "../../../../scripts/collectorUpdateField.js";
import CarrierModel from "./../models/base/Carriers.model.js";
import { Op } from "sequelize";
class CarrierController {
    static getAll = async (req, res, next) => {
        try {
            const response = await CarrierModel.findAll();
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Carriers no found" });
                return;
            }
            const carriers = response.map(c => c.toJSON());
            res.status(200).json(carriers);
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
            const response = await CarrierModel.findOne({ where: { id: id } });
            if (!response) {
                res.status(200).json({ validation: "Carrier no found" });
                return;
            }
            const carrier = response.toJSON();
            res.status(200).json(carrier);
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
    static getByName = async (req, res, next) => {
        const { name } = req.params;
        try {
            const response = await CarrierModel.findOne({ where: { name: name } });
            if (!response) {
                res.status(200).json({ validation: "Carrier no found" });
                return;
            }
            const carrier = response.toJSON();
            res.status(200).json(carrier);
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
    static getByRfc = async (req, res, next) => {
        const { rfc } = req.params;
        try {
            const response = await CarrierModel.findOne({ where: { rfc: rfc } });
            if (!response) {
                res.status(200).json({ validation: "Carrier no found" });
                return;
            }
            const carrier = response.toJSON();
            res.status(200).json(carrier);
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
        const { name, company_name, rfc, type, phone, vehicle, plates, license_number, active } = req.body;
        try {
            const validateName = await CarrierModel.findOne({ where: { name: name } });
            if (validateName) {
                res.status(200).json({
                    validation: "The name is already currently in use by a carrier"
                });
                return;
            }
            const response = await CarrierModel.create({
                name, company_name, rfc, type, phone,
                vehicle, plates, license_number,
                active
            });
            if (!response) {
                res.status(200).json({ message: "The carrier could not be created" });
                return;
            }
            res.status(201).json({ message: "Carrier created successfully" });
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
        const body = req.body;
        const { id } = req.params;
        try {
            const editableFields = CarrierModel.getEditableFields();
            const update_values = collectorUpdateFields(editableFields, body);
            const validateCarrier = await CarrierModel.findByPk(id);
            if (!validateCarrier) {
                res.status(200).json({ validation: "Carrier not found" });
                return;
            }
            if (update_values?.company_name) {
                const validateCompanyName = await CarrierModel.findOne({
                    where: {
                        [Op.and]: [
                            { rfc: update_values.rfc },
                            { id: { [Op.ne]: id } }
                        ]
                    }
                });
                if (validateCompanyName) {
                    res.status(200).json({
                        validation: "The company name is already currently in use by a carrier"
                    });
                    return;
                }
            }
            const response = await CarrierModel.update(update_values, {
                where: { id: id },
                individualHooks: true
            });
            if (!(response[0] > 0)) {
                res.status(200).json({
                    validation: "Carrier no found or no changes were made"
                });
                return;
            }
            res.status(200).json({ message: "Carrier updated succefally" });
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
    static delete = async (req, res, next) => {
        const { id } = req.params;
        try {
            const response = await CarrierModel.destroy({
                where: { id: id },
                individualHooks: true
            });
            if (!(response > 0)) {
                res.status(200).json({ validation: "Carrier not found for delete" });
                return;
            }
            res.status(200).json({ message: "Carrier deleted successfully" });
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
export default CarrierController;
