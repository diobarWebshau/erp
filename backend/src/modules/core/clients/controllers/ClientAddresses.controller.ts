import {
    Request,
    Response,
    NextFunction
} from 'express';
import {
    ClientModel,
    ClientAddressesModel
} from '../../associations.js';
import collectorUpdateFields
    from '../../../../scripts/collectorUpdateField.js';
import { Op } from 'sequelize';

class ClientsAddressesController {
    static getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const addresses = await ClientAddressesModel.findAll();
            if (addresses.length === 0) {
                res.status(200).json({
                    validation: "Client addresses no found"
                });
                return;
            }
            res.status(200).json(addresses.map(address => address.toJSON()));
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }

    static getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        try {
            const address = await ClientAddressesModel.findByPk(id);

            if (!address) {
                res.status(200).json({
                    validation: "Client address no found"
                });
                return;
            }

            res.status(200).json(address.toJSON());
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }

    static getAddressByClientId = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { id } = req.params;
        try {
            const address = await ClientAddressesModel.findAll({
                where: {
                    client_id: id
                }
            });

            if (!(address.length > 0)) {
                res.status(200).json([]);
                return;
            }

            res.status(200).json(address.map(address => address.toJSON()));
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }

    static getByLike = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { filter, client_id } = req.params;
        try {
            const results = await ClientAddressesModel.findAll({
                where: {
                    client_id,
                    [Op.or]: [
                        { street: { [Op.like]: `${filter}%` } },
                        { street_number: { [Op.like]: `${filter}%` } },
                        { neighborhood: { [Op.like]: `${filter}%` } },
                        { city: { [Op.like]: `${filter}%` } },
                        { state: { [Op.like]: `${filter}%` } },
                        { country: { [Op.like]: `${filter}%` } },
                        { zip_code: { [Op.like]: `${filter}%` } },
                    ],
                },
                attributes: ClientAddressesModel.getAllFields(),
            });

            if (!(results.length > 0)) {
                res.status(200).json([]);
                return;
            }
            const addresses = results.map(c => c.toJSON());
            res.status(200).json(addresses);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }

    static create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const {
            client_id, street, street_number,
            neighborhood, city, state, country,
            zip_code
        } = req.body;

        try {
            const client = await ClientModel.findByPk(client_id);
            if (!client) {
                res.status(200).json({
                    validation: "The assigned client does not exist"
                });
                return;
            }

            const newAddress = await ClientAddressesModel.create({
                client_id, street, street_number,
                neighborhood, city, state, country,
                zip_code
            });

            res.status(201).json({
                message: "Client address created successfully",
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }

    static update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const body = req.body;

        try {
            const editableFields = ClientAddressesModel.getEditableFields();
            const updateValues = collectorUpdateFields(editableFields, body);
            const address = await ClientAddressesModel.findByPk(id);

            if (Object.keys(updateValues).length === 0) {
                res.status(400).json({
                    validation: "There are no validated client addresses properties for the update."
                });
                return;
            }

            if (!address) {
                res.status(200).json({
                    validation: "Client address does not exist"
                });
                return;
            }

            if (updateValues?.client_id) {
                const client = await ClientModel.findByPk(updateValues.client_id);
                if (!client) {
                    res.status(200).json({
                        validation: "The assigned client does not exist"
                    });
                    return;
                }
            }

            const [updatedRows] = await ClientAddressesModel.update(updateValues, {
                where: { id },
                individualHooks: true
            });

            if (updatedRows === 0) {
                res.status(200).json({
                    validation: "No changes were made to the client address"
                });
                return;
            }

            res.status(200).json({
                message: "Client address updated successfully",
                updatedRows
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }

    static delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        try {
            const deletedRows = await ClientAddressesModel.destroy({
                where: { id },
                individualHooks: true
            });

            if (deletedRows === 0) {
                res.status(200).json({
                    validation: "Client address not found for deleted"
                });
                return;
            }

            res.status(200).json({
                message: "Client address deleted successfully",
                deletedRows
            });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
}
export default ClientsAddressesController;