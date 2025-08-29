import ImageHandler
    from "../classes/ImageHandler.js";
import path from "path";
import mime from "mime";


type BaseModelInstance = { toJSON: () => any };

/**
 * Transforma la propiedad de imagen de modelos a base64.
 * @param models Arreglo de instancias Sequelize (o similares con .toJSON()).
 * @param imageKey Clave de la propiedad de imagen (por defecto 'photo').
 */
const formatWithBase64 = async (
    models: BaseModelInstance[],
    imageKey: string = "photo"
): Promise<any[]> => {
    return await Promise.all(
        models.map(async (model) => {
            const data = model.toJSON?.() ?? model;

            const imagePath = data[imageKey];
            if (typeof imagePath === "string") {
                const normalizedPath = path.normalize(imagePath);
                const imageBase64 =
                    await ImageHandler.convertToBase64(normalizedPath);
                if (imageBase64) {
                    const mimeType = mime.getType(normalizedPath) || "application/octet-stream";
                    data[imageKey] = `data:${mimeType};base64,${imageBase64}`;
                } else {
                    data[imageKey] = null;
                }
            } else {
                data[imageKey] = null;
            }

            return data;
        })
    );
};
/**
 * Transforma un arreglo de objetos con una propiedad de path de imagen a base64.
 * @param models Arreglo de instancias Sequelize.
 * @param ObjectKey Propiedad que contiene el arreglo de imágenes (por defecto 'load_evidence').
 * @param imgKey Clave dentro del objeto que contiene el path (por defecto 'path').
 */
const formatWith64Multiple = async (
    models: BaseModelInstance[],
    ObjectKey: string = "load_evidence",
    imgKey: string = "path"
): Promise<any[]> => {
    return await Promise.all(
        models.map(async (model) => {
            const data = model.toJSON();
            const imgsPath = data[ObjectKey];

            if (Array.isArray(imgsPath)) {
                const newImgsPath = await Promise.all(
                    imgsPath.map(async (load_evidence: any) => {
                        const img = load_evidence[imgKey];
                        if (typeof img === "string") {
                            const normalizedPath =
                                path.normalize(img);
                            const imgBase64 =
                                await ImageHandler
                                    .convertToBase64(
                                        normalizedPath
                                    );
                            return {
                                ...load_evidence,
                                [imgKey]: imgBase64 || null,
                            };
                        } else {
                            return {
                                ...load_evidence,
                                [imgKey]: null,
                            };
                        }
                    })
                );
                data[ObjectKey] = newImgsPath;
            } else {
                data[ObjectKey] = null;
            }

            return data;
        })
    );
};



/**
 * Recorre un objeto recursivamente y convierte en base64 cualquier propiedad
 * cuyo nombre esté incluido en `imageKeys`, ya sea string directo o en objetos anidados o arreglos.
 */
const convertImagePropsRecursively = async (
    obj: any,
    imageKeys: string[]
): Promise<any> => {
    if (Array.isArray(obj)) {
        return Promise.all(obj.map(item => convertImagePropsRecursively(item, imageKeys)));
    }

    if (obj && typeof obj === "object") {
        const newObj: any = { ...obj };

        for (const key of Object.keys(newObj)) {
            const value = newObj[key];

            if (imageKeys.includes(key) && typeof value === "string") {
                const normalizedPath = path.normalize(value);
                const base64 =
                     await ImageHandler.convertToBase64(normalizedPath);
                if (base64) {
                    // Obtener MIME type según extensión
                    const mimeType = mime.getType(normalizedPath) || "application/octet-stream";
                    // Construir el data URI completo
                    newObj[key] = `data:${mimeType};base64,${base64}`;
                } else {
                    newObj[key] = null;
                }
            } else if (
                typeof value === "object" &&
                value !== null &&
                !(value instanceof Date)
            ) {
                newObj[key] = await convertImagePropsRecursively(value, imageKeys);
            }
        }

        return newObj;
    }

    return obj;
};
/**
 * Formatea modelos convirtiendo propiedades de imagen en base64, recorriendo profundamente.
 */
const formatImagesDeepRecursive = async (
    models: BaseModelInstance[],
    imageKeys: string[] = ["photo", "path"]
): Promise<any[]> => {
    return await Promise.all(
        models.map(async (model) => {
            const data = model.toJSON();
            return await convertImagePropsRecursively(data, imageKeys);
        })
    );
};

export {
    formatImagesDeepRecursive,
    formatWith64Multiple,
    formatWithBase64
}