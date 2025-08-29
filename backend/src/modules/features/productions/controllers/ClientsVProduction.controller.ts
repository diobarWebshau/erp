import ClientsControllers
    from "../../../core/clients/controllers/index.js";
import { ClientModel, ProductDiscountClientModel, ProductModel }
    from "../../../associations.js";
import { Request, Response, NextFunction }
    from "express";

class ClientVProductionController
    extends ClientsControllers.ClientController {
    static getDiscountsOfClient = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const client_id = Number(id);
        try {
            const validateClient = await ClientModel.findOne({ where: { id: id } });
            if (!validateClient) {
                res.status(200).json({ validation: "Client not found" });
                return;
            }
            const response = await ClientModel.findAll({
                where: { id: client_id },
                attributes: ClientModel.getAllFields(),
                include: [{
                    where: { client_id: client_id },
                    model: ProductDiscountClientModel,
                    as: "pruduct_discounts_client",
                    attributes: ProductDiscountClientModel.getAllFields(),
                    include: [{
                        model: ProductModel,
                        as: "product",
                        attributes: ProductModel.getAllFields()
                    }]
                }]
            });
            if (!(response.length > 0)) {
                res.status(200).json({ validation: "Client discounts not found fot this client" });
                return;
            }
            const discounts = response.map(d => d.toJSON());
            res.status(200).json(discounts);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    }
}

export default ClientVProductionController;