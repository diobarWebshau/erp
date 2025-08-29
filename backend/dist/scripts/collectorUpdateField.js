/**
 * Extrae únicamente los campos editables
 * presentes en el cuerpo de la solicitud.
 *
 * @param editableFields - Arreglo de claves permitidas para actualización.
 * @param body - Objeto recibido (por ejemplo, req.body)con posibles valores a actualizar.
 * @returns Un objeto con los campos válidos a actualizar y sus respectivos valores.
 */
const collectorUpdateFields = (editableFields, body) => {
    // Objeto que contendrá solo los pares clave-valor permitidos para actualizar
    const update_values = {};
    for (const key of editableFields) {
        // Verifica si el cuerpo de la petición contiene la propiedad actual
        if (Object.hasOwn(body, key)) {
            // Asigna el valor correspondiente al objeto final
            update_values[key] = body[key];
        }
    }
    return update_values;
};
export default collectorUpdateFields;
