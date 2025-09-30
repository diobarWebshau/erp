import {
    generateToken, verifyToken
} from "../../../../utils/jsonwebtoken/jwk.js";
import { verifyPassword }
    from "../../../../utils/argon/argon.js";
import {
    NextFunction, Request, Response
} from "express";
import { UserModel }
    from "../associations.js";
import { UserAttributes } from "../types.js";

interface Payload {
    username: string,
    id: number
}

class AuthController {
    static auth = async (req: Request, res: Response, next: NextFunction) => {
        const { username, password } = req.body;
        try {
            const validateUser: UserModel | null
                = await UserModel.findOne({
                    where: {
                        username: username,
                    }
                });

            if (!validateUser) {
                res.status(404).json({
                    validation:
                        "The email address entered is not "
                        + "associated with any account."
                });
                return;
            }
            const user: UserAttributes =
                validateUser.toJSON();
            const validatePassword: boolean =
                await verifyPassword(user.password, password);
            if (!validatePassword) {
                res.status(400).json({
                    validation:
                        "The password provided is incorrect."
                });
                return;
            }

            const payload: Payload = {
                username: user.username,
                id: user.id
            };
            const token: string = generateToken(payload);
            res.cookie("accessToken", token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 60 * 60 * 1000,
                path: "/",
            });
            res.status(200).json({ message: payload });
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };

    static verifyToken = async (req: Request, res: Response, next: NextFunction) => {
        const cookies = req.cookies;
        const { accessToken } = cookies;
        try {
            if (accessToken) {
                const verify =
                    verifyToken(cookies.accessToken);
                if (!verify) {
                    res.status(200).json({ valid: false });
                    return;
                }
                res.status(200).json({ valid: true, payload: verify });
                return;
            } else {
                res.status(200).json({ valid: false });
                return;
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                console.error(`An unexpected error occurred: ${error}`);
            }
        }
    };

    static logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Muy importante: usar los mismos flags que al setear la cookie
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: false,     // ponlo en true en prod bajo HTTPS
                sameSite: "lax",
                path: "/",         // explícitalo para asegurar borrado
            });

            // Alternativa equivalente (setear expirada):
            // res.cookie("accessToken", "", {
            //   httpOnly: true,
            //   secure: false,
            //   sameSite: "lax",
            //   path: "/",
            //   expires: new Date(0),
            // });

            res.status(200).json({ ok: true });
        } catch (error) {
            return next(error);
        }
    };


}

export { AuthController };
