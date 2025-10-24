import ImageHandler from "../classes/ImageHandler.js";
import path from "path";
import mime from "mime";
/**
 * Transforma la propiedad de imagen de modelos a base64.
 * @param models Arreglo de instancias Sequelize (o similares con .toJSON()).
 * @param imageKey Clave de la propiedad de imagen (por defecto 'photo').
 */
const formatWithBase64 = async (models, imageKey = "photo") => {
    return await Promise.all(models.map(async (model) => {
        const data = model.toJSON?.() ?? model;
        const imagePath = data[imageKey];
        if (typeof imagePath === "string") {
            const normalizedPath = path.normalize(imagePath);
            const imageBase64 = await ImageHandler.convertToBase64(normalizedPath);
            if (imageBase64) {
                const mimeType = mime.getType(normalizedPath) || "application/octet-stream";
                data[imageKey] = `data:${mimeType};base64,${imageBase64}`;
            }
            else {
                data[imageKey] = null;
            }
        }
        else {
            data[imageKey] = null;
        }
        return data;
    }));
};
/**
 * Transforma un arreglo de objetos con una propiedad de path de imagen a base64 (data URI).
 * @param models Arreglo de instancias Sequelize (o similares con .toJSON()).
 * @param ObjectKey Propiedad que contiene el arreglo de imágenes (por defecto 'load_evidence').
 * @param imgKey Clave dentro del objeto que contiene el path (por defecto 'path').
 */
const formatWith64Multiple = async (models, ObjectKey = "load_evidence", imgKey = "path") => {
    return await Promise.all(models.map(async (model) => {
        const data = model?.toJSON?.() ?? model;
        const imgsPath = data?.[ObjectKey];
        if (Array.isArray(imgsPath)) {
            const newImgsPath = await Promise.all(imgsPath.map(async (item) => {
                const img = item?.[imgKey];
                if (typeof img === "string" && img.trim() !== "") {
                    const normalizedPath = path.normalize(img);
                    const base64 = await ImageHandler.convertToBase64(normalizedPath);
                    if (base64) {
                        const mimeType = mime.getType(normalizedPath) || "application/octet-stream";
                        return {
                            ...item,
                            [imgKey]: `data:${mimeType};base64,${base64}`,
                        };
                    }
                }
                // Si no hay string válido o no se pudo convertir, dejar en null
                return { ...item, [imgKey]: null };
            }));
            data[ObjectKey] = newImgsPath;
        }
        else {
            data[ObjectKey] = null;
        }
        return data;
    }));
};
/**
 * Recorre un objeto recursivamente y convierte en base64 cualquier propiedad
 * cuyo nombre esté incluido en `imageKeys`, ya sea string directo o en objetos anidados o arreglos.
 */
const convertImagePropsRecursively = async (obj, imageKeys) => {
    if (Array.isArray(obj)) {
        return Promise.all(obj.map(item => convertImagePropsRecursively(item, imageKeys)));
    }
    if (obj && typeof obj === "object") {
        const newObj = { ...obj };
        for (const key of Object.keys(newObj)) {
            const value = newObj[key];
            if (imageKeys.includes(key) && typeof value === "string") {
                const normalizedPath = path.normalize(value);
                const base64 = await ImageHandler.convertToBase64(normalizedPath);
                if (base64) {
                    // Obtener MIME type según extensión
                    const mimeType = mime.getType(normalizedPath) || "application/octet-stream";
                    // Construir el data URI completo
                    newObj[key] = `data:${mimeType};base64,${base64}`;
                }
                else {
                    newObj[key] = null;
                }
            }
            else if (typeof value === "object" &&
                value !== null &&
                !(value instanceof Date)) {
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
const formatImagesDeepRecursive = async (models, imageKeys = ["photo", "path"]) => {
    return await Promise.all(models.map(async (model) => {
        const data = model.toJSON();
        return await convertImagePropsRecursively(data, imageKeys);
    }));
};
export { formatImagesDeepRecursive, formatWith64Multiple, formatWithBase64 };
